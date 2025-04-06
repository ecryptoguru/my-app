import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Initialize the Supabase client with proper environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Define a type for the query builder that includes common methods
interface QueryBuilder {
  select: (columns?: string) => QueryBuilder;
  eq: (column: string, value: unknown) => QueryBuilder;
  neq: (column: string, value: unknown) => QueryBuilder;
  gt: (column: string, value: unknown) => QueryBuilder;
  gte: (column: string, value: unknown) => QueryBuilder;
  lt: (column: string, value: unknown) => QueryBuilder;
  lte: (column: string, value: unknown) => QueryBuilder;
  like: (column: string, pattern: string) => QueryBuilder;
  ilike: (column: string, pattern: string) => QueryBuilder;
  is: (column: string, value: unknown) => QueryBuilder;
  in: (column: string, values: unknown[]) => QueryBuilder;
  contains: (column: string, value: unknown) => QueryBuilder;
  containedBy: (column: string, value: unknown) => QueryBuilder;
  range: (column: string, from: unknown, to: unknown) => QueryBuilder;
  textSearch: (column: string, query: string, options?: { config?: string }) => QueryBuilder;
  filter: (column: string, operator: string, value: unknown) => QueryBuilder;
  not: (column: string, operator: string, value: unknown) => QueryBuilder;
  or: (filters: string, options?: { foreignTable?: string }) => QueryBuilder;
  and: (filters: string, options?: { foreignTable?: string }) => QueryBuilder;
  order: (column: string, options?: { ascending?: boolean; nullsFirst?: boolean; foreignTable?: string }) => QueryBuilder;
  limit: (count: number) => QueryBuilder;
  offset: (count: number) => QueryBuilder;
  single: () => QueryBuilder;
  maybeSingle: () => QueryBuilder;
  csv: () => QueryBuilder;
  then: <T>(onFulfilled: (value: unknown) => T) => Promise<T>;
}

// Type for the query result
interface QueryResult<T> {
  data: T[] | null;
  error: Error | null;
}

// CRUD Operations

/**
 * Insert a record into a table
 * @param table The table name
 * @param data The data to insert
 * @returns The inserted record
 */
export async function insertRecord<T>(table: string, data: T) {
  const { data: record, error } = await supabase
    .from(table)
    .insert(data)
    .select()
    .single();
  
  if (error) {
    console.error(`Error inserting into ${table}:`, error);
    throw error;
  }
  
  return record;
}

/**
 * Get records from a table with optional filters
 * @param table The table name
 * @param queryBuilder Optional function to customize the query
 * @returns The fetched records
 */
export async function getRecords<T>(
  table: string, 
  queryBuilder?: (query: QueryBuilder) => QueryBuilder
) {
  let query = supabase.from(table).select('*') as unknown as QueryBuilder;
  
  if (queryBuilder) {
    query = queryBuilder(query);
  }
  
  const { data, error } = await (query as unknown as Promise<QueryResult<T>>);
  
  if (error) {
    console.error(`Error fetching from ${table}:`, error);
    throw error;
  }
  
  return data as T[];
}

/**
 * Update a record in a table
 * @param table The table name
 * @param id The record ID
 * @param data The data to update
 * @returns The updated record
 */
export async function updateRecord<T>(table: string, id: string, data: Partial<T>) {
  const { data: record, error } = await supabase
    .from(table)
    .update(data)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error(`Error updating in ${table}:`, error);
    throw error;
  }
  
  return record;
}

/**
 * Delete a record from a table
 * @param table The table name
 * @param id The record ID
 * @returns Success status
 */
export async function deleteRecord(table: string, id: string) {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error(`Error deleting from ${table}:`, error);
    throw error;
  }
  
  return true;
}

// File Storage Operations

/**
 * Upload a file to Supabase Storage
 * @param bucket The storage bucket name
 * @param path The file path within the bucket
 * @param file The file to upload
 * @returns The file URL
 */
export async function uploadFile(bucket: string, path: string, file: File) {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });
  
  if (error) {
    console.error(`Error uploading file to ${bucket}/${path}:`, error);
    throw error;
  }
  
  return getFileUrl(bucket, path);
}

/**
 * Get the public URL of a file
 * @param bucket The storage bucket name
 * @param path The file path within the bucket
 * @returns The public URL
 */
export function getFileUrl(bucket: string, path: string) {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return data.publicUrl;
}

/**
 * Delete a file from Supabase Storage
 * @param bucket The storage bucket name
 * @param path The file path within the bucket
 * @returns Success status
 */
export async function deleteFile(bucket: string, path: string) {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);
  
  if (error) {
    console.error(`Error deleting file from ${bucket}/${path}:`, error);
    throw error;
  }
  
  return true;
}
