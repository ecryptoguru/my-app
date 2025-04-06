/**
 * DeepSeek API client
 * 
 * This module provides functions to interact with the DeepSeek AI APIs.
 * It handles authentication, request formatting, and error handling.
 */

// Types for API requests and responses
export interface DeepSeekRequestOptions {
  endpoint: string;
  data: Record<string, unknown>;
  apiVersion?: string;
}

export interface DeepSeekResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
  };
}

/**
 * Main function to call DeepSeek API endpoints
 * 
 * @param options - Request options including endpoint and data
 * @returns Promise with the API response
 */
export async function callDeepSeek<T = unknown>({
  endpoint,
  data,
  apiVersion = 'v1'
}: DeepSeekRequestOptions): Promise<DeepSeekResponse<T>> {
  // Get API key from environment variables
  const apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
  
  if (!apiKey) {
    console.error('DeepSeek API key is not configured');
    return {
      success: false,
      error: {
        message: 'API key is not configured',
        code: 'auth_error'
      }
    };
  }

  try {
    const response = await fetch(`https://api.deepseek.com/${apiVersion}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: {
          message: errorData.message || 'API request failed',
          code: errorData.code || `status_${response.status}`
        }
      };
    }

    const responseData = await response.json();
    return {
      success: true,
      data: responseData as T
    };
  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'request_error'
      }
    };
  }
}

/**
 * Specialized function for time series forecasting
 */
export async function timeSeriesForecasting(
  data: number[],
  periods: number,
  options?: {
    frequency?: 'daily' | 'weekly' | 'monthly';
    seasonality?: boolean;
  }
): Promise<DeepSeekResponse<{ forecast: number[] }>> {
  return callDeepSeek<{ forecast: number[] }>({
    endpoint: 'forecasting/timeseries',
    data: {
      data,
      periods,
      frequency: options?.frequency || 'daily',
      seasonality: options?.seasonality ?? true
    }
  });
}

/**
 * Specialized function for text generation
 */
export async function generateText(
  prompt: string,
  options?: {
    maxTokens?: number;
    temperature?: number;
    topP?: number;
  }
): Promise<DeepSeekResponse<{ text: string }>> {
  return callDeepSeek<{ text: string }>({
    endpoint: 'text/generate',
    data: {
      prompt,
      max_tokens: options?.maxTokens || 1000,
      temperature: options?.temperature || 0.7,
      top_p: options?.topP || 0.9
    }
  });
}

/**
 * Specialized function for document analysis
 */
export async function analyzeDocument(
  text: string,
  analysisType: 'summary' | 'entities' | 'sentiment' | 'keywords'
): Promise<DeepSeekResponse<Record<string, unknown>>> {
  return callDeepSeek<Record<string, unknown>>({
    endpoint: 'document/analyze',
    data: {
      text,
      analysis_type: analysisType
    }
  });
}

/**
 * Specialized function for image generation
 */
export async function generateImage(
  prompt: string,
  options?: {
    width?: number;
    height?: number;
    style?: string;
  }
): Promise<DeepSeekResponse<{ imageUrl: string }>> {
  return callDeepSeek<{ imageUrl: string }>({
    endpoint: 'image/generate',
    data: {
      prompt,
      width: options?.width || 1024,
      height: options?.height || 1024,
      style: options?.style || 'natural'
    }
  });
}
