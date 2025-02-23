<template>
    <div class="not-found-container">
      <div class="content">
        <h1 class="error-code">404</h1>
        <h2 class="error-title">Page Not Found</h2>
        <p class="error-message">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <div class="actions">
          <button @click="goBack" class="back-button">
            Go Back
          </button>
          <router-link to="/" class="home-link">
            Return to Home
          </router-link>
        </div>
        <div class="search-section" v-if="showSearch">
          <p class="search-prompt">Try searching for what you need:</p>
          <div class="search-box">
            <input 
              type="text" 
              v-model="searchQuery" 
              @keyup.enter="handleSearch"
              placeholder="Search..."
              class="search-input"
            >
            <button @click="handleSearch" class="search-button">
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'NotFound',
    
    data() {
      return {
        searchQuery: '',
        showSearch: false, // Set to true to enable search functionality
      }
    },
  
    methods: {
      goBack() {
        window.history.length > 1
          ? this.$router.go(-1)
          : this.$router.push('/')
      },
  
      handleSearch() {
        if (this.searchQuery.trim()) {
          // Implement your search logic here
          this.$router.push({
            name: 'search',
            query: { q: this.searchQuery }
          })
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .not-found-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background-color: #f8f9fa;
  }
  
  .content {
    text-align: center;
    max-width: 600px;
    padding: 40px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .error-code {
    font-size: 8rem;
    font-weight: 700;
    color: #e74c3c;
    margin: 0;
    line-height: 1;
  }
  
  .error-title {
    font-size: 2rem;
    color: #2c3e50;
    margin: 20px 0;
  }
  
  .error-message {
    color: #7f8c8d;
    font-size: 1.1rem;
    margin-bottom: 30px;
  }
  
  .actions {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-bottom: 30px;
  }
  
  .back-button,
  .home-link,
  .search-button {
    padding: 12px 24px;
    border-radius: 6px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.3s ease;
  }
  
  .back-button {
    background-color: #e74c3c;
    color: white;
    border: none;
    cursor: pointer;
  }
  
  .back-button:hover {
    background-color: #c0392b;
  }
  
  .home-link {
    background-color: #3498db;
    color: white;
  }
  
  .home-link:hover {
    background-color: #2980b9;
  }
  
  .search-section {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #eee;
  }
  
  .search-prompt {
    color: #7f8c8d;
    margin-bottom: 15px;
  }
  
  .search-box {
    display: flex;
    gap: 10px;
    justify-content: center;
  }
  
  .search-input {
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    width: 100%;
    max-width: 300px;
  }
  
  .search-button {
    background-color: #2ecc71;
    color: white;
    border: none;
    cursor: pointer;
  }
  
  .search-button:hover {
    background-color: #27ae60;
  }
  
  @media (max-width: 480px) {
    .error-code {
      font-size: 6rem;
    }
  
    .error-title {
      font-size: 1.5rem;
    }
  
    .actions {
      flex-direction: column;
    }
  
    .search-box {
      flex-direction: column;
    }
  
    .search-input {
      max-width: 100%;
    }
  }
  </style>