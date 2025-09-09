const { client } = require('../config/elasticsearch');
const Product = require('../models/product');

const elasticsearchService = {
  // Index một sản phẩm vào Elasticsearch
  indexProduct: async (product) => {
    try {
      const response = await client.index({
        index: 'products',
        id: product._id.toString(),
        body: {
          name: product.name,
          description: product.description,
          category: product.category,
          price: product.price,
          stock: product.stock,
          tags: product.tags,
          image: product.image,
          isActive: product.isActive,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        }
      });
      
      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi index sản phẩm',
        error: error.message
      };
    }
  },

  // Index tất cả sản phẩm từ MongoDB vào Elasticsearch
  indexAllProducts: async () => {
    try {
      const products = await Product.find({ isActive: true });
      let successCount = 0;
      let errorCount = 0;

      for (const product of products) {
        const result = await elasticsearchService.indexProduct(product);
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
          console.error(`Error indexing product ${product._id}:`, result.error);
        }
      }

      return {
        success: true,
        message: `Indexed ${successCount} products successfully, ${errorCount} errors`,
        data: {
          successCount,
          errorCount,
          total: products.length
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi index tất cả sản phẩm',
        error: error.message
      };
    }
  },

  // Fuzzy search sản phẩm
  searchProducts: async (query, page = 1, limit = 10, category = null, minPrice = undefined, maxPrice = undefined) => {
    try {
      const from = (page - 1) * limit;
      
      // Tạo query cho fuzzy search
      let searchQuery = {
        bool: {
          must: [
            {
              bool: {
                should: [
                  // Fuzzy search cho tên sản phẩm
                  {
                    fuzzy: {
                      name: {
                        value: query,
                        fuzziness: 'AUTO',
                        max_expansions: 50
                      }
                    }
                  },
                  // Match phrase cho tên sản phẩm
                  {
                    match_phrase: {
                      name: {
                        query: query,
                        boost: 2
                      }
                    }
                  },
                  // Match cho mô tả
                  {
                    match: {
                      description: {
                        query: query,
                        fuzziness: 'AUTO'
                      }
                    }
                  },
                  // Match cho tags
                  {
                    match: {
                      tags: {
                        query: query,
                        fuzziness: 'AUTO'
                      }
                    }
                  }
                ],
                minimum_should_match: 1
              }
            }
          ],
          filter: [
            { term: { isActive: true } }
          ]
        }
      };

      // Thêm filter theo category nếu có
      if (category && category !== 'all') {
        searchQuery.bool.filter.push({ term: { category: category } });
      }

      // Thêm filter theo price range nếu có
      if (minPrice !== undefined || maxPrice !== undefined) {
        const range = { range: { price: {} } };
        if (minPrice !== undefined) {
          range.range.price.gte = minPrice;
        }
        if (maxPrice !== undefined) {
          range.range.price.lte = maxPrice;
        }
        searchQuery.bool.filter.push(range);
      }

      const response = await client.search({
        index: 'products',
        body: {
          query: searchQuery,
          from: from,
          size: limit,
          sort: [
            { _score: { order: 'desc' } },
            { createdAt: { order: 'desc' } }
          ],
          highlight: {
            fields: {
              name: {
                fragment_size: 150,
                number_of_fragments: 3
              },
              description: {
                fragment_size: 150,
                number_of_fragments: 2
              }
            }
          }
        }
      });

      // Lấy tổng số kết quả
      const total = response.hits.total.value;
      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      // Chuyển đổi kết quả từ Elasticsearch format sang format mong muốn
      const products = response.hits.hits.map(hit => ({
        _id: hit._id,
        name: hit._source.name,
        description: hit._source.description,
        price: hit._source.price,
        category: hit._source.category,
        image: hit._source.image,
        stock: hit._source.stock,
        isActive: hit._source.isActive,
        tags: hit._source.tags,
        createdAt: hit._source.createdAt,
        updatedAt: hit._source.updatedAt,
        score: hit._score,
        highlights: hit.highlight
      }));

      return {
        success: true,
        data: {
          products,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems: total,
            itemsPerPage: limit,
            hasNext,
            hasPrev
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi tìm kiếm sản phẩm',
        error: error.message
      };
    }
  },

  // Xóa sản phẩm khỏi index
  deleteProduct: async (productId) => {
    try {
      await client.delete({
        index: 'products',
        id: productId.toString()
      });
      
      return {
        success: true,
        message: 'Xóa sản phẩm khỏi index thành công'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi xóa sản phẩm khỏi index',
        error: error.message
      };
    }
  },

  // Cập nhật sản phẩm trong index
  updateProduct: async (product) => {
    try {
      await client.index({
        index: 'products',
        id: product._id.toString(),
        body: {
          name: product.name,
          description: product.description,
          category: product.category,
          price: product.price,
          stock: product.stock,
          tags: product.tags,
          image: product.image,
          isActive: product.isActive,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        }
      });
      
      return {
        success: true,
        message: 'Cập nhật sản phẩm trong index thành công'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi cập nhật sản phẩm trong index',
        error: error.message
      };
    }
  }
};

module.exports = elasticsearchService;

