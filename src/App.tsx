import React, { useState } from 'react';
import './App.css';

interface OpenAPISpec {
  openapi: string;
  info: any;
  paths: any;
  components?: any;
  servers?: any[];
  security?: any[];
  tags?: any[];
}

interface APIEndpoint {
  path: string;
  method: string;
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: any[];
  responses?: any;
}

function App() {
  const [collectionUrl, setCollectionUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [openApiSpec, setOpenApiSpec] = useState<OpenAPISpec | null>(null);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'endpoints' | 'models' | 'raw'>('overview');

  // Extract collection_uuid from Postman Collection URL
  const extractCollectionUuid = (url: string): string | null => {
    try {
      // Pattern matching: https://api.postman.com/collections/{collection_uuid}
      const regex = /https:\/\/api\.postman\.com\/collections\/([a-f0-9-]+)/i;
      const match = url.match(regex);
      return match ? match[1] : null;
    } catch (error) {
      console.error('Error extracting collection UUID:', error);
      return null;
    }
  };

  // Call Postman Transform Collection API
  const transformCollectionToOpenAPI = async (collectionUuid: string): Promise<OpenAPISpec | null> => {
    try {
      // Use Postman's public API to transform Collection to OpenAPI
      const response = await fetch(`https://api.postman.com/collections/${collectionUuid}/transformations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.REACT_APP_POSTMAN_API_KEY || ''
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      // Parse the returned OpenAPI specification
      if (result.output) {
        const openApiData = result.output;
        return typeof openApiData === 'string' ? JSON.parse(openApiData) : openApiData;
      }
      
      throw new Error('No OpenAPI specification returned from API');
    } catch (error) {
      console.error('Error transforming collection:', error);
      throw error;
    }
  };

  // Parse API endpoints
  const parseEndpoints = (spec: OpenAPISpec): APIEndpoint[] => {
    const endpoints: APIEndpoint[] = [];
    
    if (spec.paths) {
      Object.entries(spec.paths).forEach(([path, pathItem]: [string, any]) => {
        Object.entries(pathItem).forEach(([method, operation]: [string, any]) => {
          if (['get', 'post', 'put', 'delete', 'patch', 'head', 'options'].includes(method.toLowerCase())) {
            endpoints.push({
              path,
              method: method.toUpperCase(),
              summary: operation.summary,
              description: operation.description,
              tags: operation.tags,
              parameters: operation.parameters,
              responses: operation.responses
            });
          }
        });
      });
    }
    
    return endpoints;
  };

  // Get method statistics
  const getMethodStats = (endpoints: APIEndpoint[]) => {
    const stats = endpoints.reduce((acc, endpoint) => {
      acc[endpoint.method] = (acc[endpoint.method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return stats;
  };

  // Get tag statistics
  const getTagStats = (endpoints: APIEndpoint[]) => {
    const tagCounts = endpoints.reduce((acc, endpoint) => {
      if (endpoint.tags) {
        endpoint.tags.forEach(tag => {
          acc[tag] = (acc[tag] || 0) + 1;
        });
      }
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
  };

  // Get model definitions
  const getModels = (spec: OpenAPISpec) => {
    return spec.components?.schemas || {};
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectionUrl.trim()) {
      setError('Please enter a Postman Collection API URL');
      return;
    }
    
    // Check if API key is configured
    if (!process.env.REACT_APP_POSTMAN_API_KEY) {
      setError('Postman API key is not configured. Please check your .env file and ensure REACT_APP_POSTMAN_API_KEY is set.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setOpenApiSpec(null);

    try {
      // Extract collection UUID
      const collectionUuid = extractCollectionUuid(collectionUrl);
      if (!collectionUuid) {
        throw new Error('Invalid Postman Collection URL format. Please ensure the URL follows the format: https://api.postman.com/collections/{collection_uuid}');
      }

      console.log('Extracted Collection UUID:', collectionUuid);
      
      // Call transformation API
      const openApiData = await transformCollectionToOpenAPI(collectionUuid);
      
      if (openApiData) {
        setOpenApiSpec(openApiData);
        setActiveTab('overview');
        console.log('Generated OpenAPI Spec:', openApiData);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Error processing collection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadOpenAPISpec = () => {
    if (!openApiSpec) return;
    
    const dataStr = JSON.stringify(openApiSpec, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${openApiSpec.info?.title?.replace(/\s+/g, '-').toLowerCase() || 'api'}-openapi-spec.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const endpoints = openApiSpec ? parseEndpoints(openApiSpec) : [];
  const methodStats = getMethodStats(endpoints);
  const tagStats = getTagStats(endpoints);
  const models = openApiSpec ? getModels(openApiSpec) : {};

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>API Specification Platform</h1>
          <p>Transform Postman Collections into OpenAPI specifications and manage your APIs</p>
        </header>

        <main className="main-content">
          <div className="card">
            <h2>Step-by-Step Guide</h2>
            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Open Postman</h3>
                  <p>Open the Postman application and navigate to the collection you want to share</p>
                </div>
              </div>
              
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Click Share Button</h3>
                  <p>Find and click the "Share" button on the collection page</p>
                </div>
              </div>
              
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Select Share via API</h3>
                  <p>Choose "Share via API" from the sharing options</p>
                </div>
              </div>
              
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h3>Copy API URL</h3>
                  <p>Copy the generated API URL and paste it in the input field below</p>
                  <div className="example-url">
                    <span className="example-label">Example:</span>
                    <code className="url-example">
                      https://api.postman.com/collections/47373031-63ae07b7-57fa-478a-8b9b-585052fce3a6
                    </code>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="form">
              <div className="input-group">
                <label htmlFor="collectionUrl">Collection API URL:</label>
                <input
                  type="url"
                  id="collectionUrl"
                  value={collectionUrl}
                  onChange={(e) => setCollectionUrl(e.target.value)}
                  placeholder="https://api.postman.com/collections/..."
                  required
                  className="url-input"
                />
              </div>
              
              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  {error}
                </div>
              )}
              
              <button 
                type="submit" 
                className="submit-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Generate OpenAPI Spec'}
              </button>
            </form>

            {openApiSpec && (
              <div className="result-section">
                <div className="result-header">
                  <h3>API Specification Generated Successfully!</h3>
                  <div className="main-actions">
                    <button onClick={downloadOpenAPISpec} className="download-btn">
                      📥 Download JSON
                    </button>
                    <button onClick={() => copyToClipboard(JSON.stringify(openApiSpec, null, 2))} className="copy-btn">
                      📋 Copy JSON
                    </button>
                  </div>
                </div>

                <div className="tabs">
                  <button 
                    className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                  >
                    📊 Overview
                  </button>
                  <button 
                    className={`tab ${activeTab === 'endpoints' ? 'active' : ''}`}
                    onClick={() => setActiveTab('endpoints')}
                  >
                    🔗 Endpoints ({endpoints.length})
                  </button>
                  <button 
                    className={`tab ${activeTab === 'raw' ? 'active' : ''}`}
                    onClick={() => setActiveTab('raw')}
                  >
                    📄 Raw JSON
                  </button>
                </div>

                <div className="tab-content">
                  {activeTab === 'overview' && (
                    <div className="overview-tab">
                      <div className="api-info-grid">
                        <div className="info-card">
                          <h4>📝 API Information</h4>
                          <div className="info-item">
                            <strong>Title:</strong> {openApiSpec.info?.title || 'N/A'}
                          </div>
                          <div className="info-item">
                            <strong>Version:</strong> {openApiSpec.info?.version || 'N/A'}
                          </div>
                          <div className="info-item">
                            <strong>Description:</strong> {openApiSpec.info?.description || 'No description provided'}
                          </div>
                          <div className="info-item">
                            <strong>OpenAPI Version:</strong> {openApiSpec.openapi}
                          </div>
                        </div>

                        <div className="info-card">
                          <h4>🔧 HTTP Methods</h4>
                          <div className="method-stats">
                            {Object.entries(methodStats).map(([method, count]) => (
                              <div key={method} className="method-item">
                                <span className={`method-badge method-${method.toLowerCase()}`}>
                                  {method}
                                </span>
                                <span className="method-count">{count}</span>
                              </div>
                            ))}
                          </div>
                        </div>


                        {openApiSpec.security && openApiSpec.security.length > 0 && (
                          <div className="info-card">
                            <h4>🔐 Security</h4>
                            <div className="security-info">
                              Security schemes defined: {openApiSpec.security.length}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'endpoints' && (
                    <div className="endpoints-tab">
                      <div className="endpoints-list">
                        {endpoints.map((endpoint, index) => (
                          <div key={index} className="endpoint-item">
                            <div className="endpoint-header">
                              <span className={`method-badge method-${endpoint.method.toLowerCase()}`}>
                                {endpoint.method}
                              </span>
                              <code className="endpoint-path">{endpoint.path}</code>
                            </div>
                            {endpoint.summary && (
                              <div className="endpoint-summary">{endpoint.summary}</div>
                            )}
                            {endpoint.description && (
                              <div className="endpoint-description">{endpoint.description}</div>
                            )}
                            {endpoint.tags && endpoint.tags.length > 0 && (
                              <div className="endpoint-tags">
                                {endpoint.tags.map((tag, tagIndex) => (
                                  <span key={tagIndex} className="endpoint-tag">{tag}</span>
                                ))}
                              </div>
                            )}
                            {endpoint.parameters && endpoint.parameters.length > 0 && (
                              <div className="endpoint-params">
                                <strong>Parameters:</strong> {endpoint.parameters.length}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'raw' && (
                    <div className="raw-tab">
                      <div className="json-actions">
                        <button onClick={() => copyToClipboard(JSON.stringify(openApiSpec, null, 2))} className="copy-json-btn">
                          📋 Copy JSON
                        </button>
                      </div>
                      <pre className="spec-json">
                        {JSON.stringify(openApiSpec, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>

        <footer className="footer">
          <p>&copy; 2024 API Specification Platform</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
