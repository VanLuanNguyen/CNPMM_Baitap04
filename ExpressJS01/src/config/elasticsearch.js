require('dotenv').config();
const { Client } = require('@elastic/elasticsearch');

// Cấu hình Elasticsearch client
const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME || '',
    password: process.env.ELASTICSEARCH_PASSWORD || ''
  }
});

// Kiểm tra kết nối Elasticsearch
const checkConnection = async () => {
  try {
    const response = await client.ping();
    console.log('✅ Elasticsearch connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Elasticsearch connection failed:', error.message);
    return false;
  }
};

// Tạo index cho products
const createProductsIndex = async () => {
  try {
    const indexName = 'products';
    
    // Kiểm tra xem index đã tồn tại chưa
    const indexExists = await client.indices.exists({ index: indexName });
    
    if (!indexExists) {
      // Tạo index với mapping cho fuzzy search
      await client.indices.create({
        index: indexName,
        body: {
          mappings: {
            properties: {
              name: {
                type: 'text',
                analyzer: 'standard',
                fields: {
                  fuzzy: {
                    type: 'text',
                    analyzer: 'standard'
                  },
                  keyword: {
                    type: 'keyword'
                  }
                }
              },
              description: {
                type: 'text',
                analyzer: 'standard',
                fields: {
                  fuzzy: {
                    type: 'text',
                    analyzer: 'standard'
                  }
                }
              },
              category: {
                type: 'keyword'
              },
              price: {
                type: 'float'
              },
              stock: {
                type: 'integer'
              },
              tags: {
                type: 'text',
                analyzer: 'standard',
                fields: {
                  keyword: {
                    type: 'keyword'
                  }
                }
              },
              image: {
                type: 'keyword'
              },
              isActive: {
                type: 'boolean'
              },
              createdAt: {
                type: 'date'
              },
              updatedAt: {
                type: 'date'
              }
            }
          },
          settings: {
            analysis: {
              analyzer: {
                fuzzy_analyzer: {
                  type: 'custom',
                  tokenizer: 'standard',
                  filter: ['lowercase', 'asciifolding']
                }
              }
            }
          }
        }
      });
      console.log(`✅ Created index: ${indexName}`);
    } else {
      console.log(`ℹ️  Index ${indexName} already exists`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error creating index:', error.message);
    return false;
  }
};

// Xóa index (để reset dữ liệu)
const deleteProductsIndex = async () => {
  try {
    const indexName = 'products';
    await client.indices.delete({ index: indexName });
    console.log(`✅ Deleted index: ${indexName}`);
    return true;
  } catch (error) {
    console.error('❌ Error deleting index:', error.message);
    return false;
  }
};

module.exports = {
  client,
  checkConnection,
  createProductsIndex,
  deleteProductsIndex
};

