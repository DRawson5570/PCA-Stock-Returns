const Configuration = require('../models/Configuration');

class ConfigurationService {
  async getConfiguration(userId) {
    try {
      console.log(`Fetching configuration for user: ${userId}`);
      
      let config = await Configuration.findOne({ userId });
      
      if (!config) {
        // Create default configuration if none exists
        config = new Configuration({ 
          userId,
          oandaConfig: {
            apiKey: '',
            accountId: '',
            environment: 'practice'
          },
          ddeConfig: {
            serviceName: 'ElwaveDDE',
            refreshInterval: 1000
          },
          historicalConfig: {
            maxDays: 30,
            defaultTimeframe: 'H1'
          }
        });
        await config.save();
        console.log('Created default configuration for user');
      }

      // Mask the API key for security
      const configData = config.toObject();
      if (configData.oandaConfig && configData.oandaConfig.apiKey) {
        configData.oandaConfig.apiKey = '****-****-****-****';
      }

      return configData;
    } catch (error) {
      console.error('Error fetching configuration:', error.message);
      throw error;
    }
  }

  async updateConfiguration(userId, updateData) {
    try {
      console.log(`Updating configuration for user: ${userId}`);
      
      let config = await Configuration.findOne({ userId });
      
      if (!config) {
        config = new Configuration({ userId });
      }

      // Update only provided fields
      if (updateData.oandaConfig) {
        config.oandaConfig = { ...config.oandaConfig, ...updateData.oandaConfig };
      }
      
      if (updateData.ddeConfig) {
        config.ddeConfig = { ...config.ddeConfig, ...updateData.ddeConfig };
      }
      
      if (updateData.historicalConfig) {
        config.historicalConfig = { ...config.historicalConfig, ...updateData.historicalConfig };
      }

      await config.save();
      console.log('Configuration updated successfully');
      
      return { success: true, message: 'Configuration updated successfully' };
    } catch (error) {
      console.error('Error updating configuration:', error.message);
      throw error;
    }
  }

  async validateOandaConfiguration(userId) {
    try {
      const config = await Configuration.findOne({ userId });
      
      if (!config || !config.oandaConfig || !config.oandaConfig.apiKey || !config.oandaConfig.accountId) {
        return { valid: false, message: 'OANDA API configuration is incomplete' };
      }

      return { valid: true, message: 'OANDA API configuration is valid' };
    } catch (error) {
      console.error('Error validating OANDA configuration:', error.message);
      return { valid: false, message: 'Error validating configuration' };
    }
  }
}

module.exports = new ConfigurationService();