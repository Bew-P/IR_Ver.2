const express = require('express');
const { Client } = require('@elastic/elasticsearch');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 8080;

// Enable CORS for the frontend
app.use(cors({ origin: 'http://localhost:3000' }));

// Middleware to parse JSON body
app.use(express.json());

// Elasticsearch Client Setup
const client = new Client({
    node: 'https://localhost:9200',
    auth: {
        username: 'elastic', 
        password: '-yXOSpd5xGGRORBGyGMf', 
    },
    tls: {
        rejectUnauthorized: false,
        ca: fs.readFileSync(path.join(__dirname, 'http_ca.crt')),
    },
});

// Test Elasticsearch Connection
(async () => {
    try {
        const health = await client.cluster.health();
        console.log('Elasticsearch cluster health:', health);
    } catch (error) {
        console.error('Error connecting to Elasticsearch:', error);
    }
})();

// Route to Fetch All Plant Data
app.get('/', async (req, res) => {
    try {
        const indexName = 'plant'; 
        const result = await client.search({
            index: indexName,
            query: { match_all: {} }, // Fetch all documents
            size: 1000, 
        });

        // Extract and return the plant data
        const plantData = result.hits.hits.map((hit) => hit._source);
        res.json(plantData);
    } catch (error) {
        console.error('Error fetching plant data:', error);
        res.status(500).json({ error: 'Failed to fetch plant data' });
    }
});

// Route to Search Plant Data
app.post('/search', async (req, res) => {
    try {
        // Extract the search query from the request body
        const { query: searchQuery } = req.body;

        if (!searchQuery) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }

        const indexName = 'plant';

        // Build a multi-field query to search across multiple fields
        const query = {
            query: {
                bool: {
                    should: [
                        {
                            multi_match: { // Phrase match across multiple fields
                                query: searchQuery,
                                fields: [
                                    "Disease Prevention",
                                    "Health power",
                                    "How to Grow",
                                    "Insect Control",
                                    "Keywords^2",
                                    "Vitamin and Mineral",
                                    "Plant Name^2"
                                ],
                                type: "phrase", // Ensures phrase matching
                                boost: 2 // Prioritize exact phrase matches
                            }
                        },
                        {
                            multi_match: { // Flexible matching
                                query: searchQuery,
                                fields: [
                                    "Disease Prevention",
                                    "Health power",
                                    "How to Grow",
                                    "Insect Control",
                                    "Keywords^2",
                                    "Vitamin and Mineral",
                                    "Plant Name^2"
                                ],
                                fuzziness: "AUTO", // Allow for typos in multi-term searches
                                operator: "or"    // Match any term across fields
                            }
                        }
                    ],
                    minimum_should_match: 1 // Ensure at least one clause matches
                }
            }
        };
                
        

        const result = await client.search({
            index: indexName,
            body: query
        });

        // Extract and return the search results
        const searchResults = result.hits.hits.map((hit) => hit._source);
        res.json(searchResults);
    } catch (error) {
        console.error('Error searching plant data:', error);
        res.status(500).json({ error: 'Failed to search plant data' });
    }
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
