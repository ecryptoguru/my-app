'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { supabase, uploadFile, insertRecord, getRecords, deleteRecord } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Database, Trash2 } from 'lucide-react';
import { Database as SupabaseDatabase } from '@/types/supabase';

export default function SupabaseDemo() {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<SupabaseDatabase['public']['Tables']['files']['Row'][]>([]);
  const [userData, setUserData] = useState({ name: '', email: '' });
  const [users, setUsers] = useState<SupabaseDatabase['public']['Tables']['users']['Row'][]>([]);
  const [loading, setLoading] = useState(false);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!file) return;
    
    try {
      setUploading(true);
      
      // Generate a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${session?.user?.id || 'anonymous'}/${fileName}`;
      
      // Upload the file to Supabase Storage
      const fileUrl = await uploadFile('uploads', filePath, file);
      
      // Store file metadata in the database
      await insertRecord('files', {
        name: file.name,
        path: filePath,
        size: file.size,
        type: file.type,
        user_id: session?.user?.id || 'anonymous',
        url: fileUrl // Store the URL in the database
      });
      
      // Refresh the file list
      fetchFiles();
      
      // Reset the file input
      setFile(null);
      
      alert('File uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Fetch uploaded files
  const fetchFiles = async () => {
    try {
      const files = await getRecords<SupabaseDatabase['public']['Tables']['files']['Row']>('files', (query) => 
        query.eq('user_id', session?.user?.id || 'anonymous').order('created_at', { ascending: false })
      );
      setUploadedFiles(files);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  // Delete a file
  const handleDeleteFile = async (id: string, path: string) => {
    try {
      // Delete from storage
      await supabase.storage.from('uploads').remove([path]);
      
      // Delete from database
      await deleteRecord('files', id);
      
      // Refresh the file list
      fetchFiles();
      
      alert('File deleted successfully!');
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error deleting file. Please try again.');
    }
  };

  // Handle user data input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  // Save user data
  const handleSaveUser = async () => {
    if (!userData.name || !userData.email) {
      alert('Please fill in all fields');
      return;
    }
    
    try {
      setLoading(true);
      
      await insertRecord('users', {
        name: userData.name,
        email: userData.email,
        id: Math.random().toString(36).substring(2, 15)
      });
      
      setUserData({ name: '', email: '' });
      fetchUsers();
      
      alert('User data saved successfully!');
    } catch (error) {
      console.error('Error saving user data:', error);
      alert('Error saving user data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const users = await getRecords<SupabaseDatabase['public']['Tables']['users']['Row']>('users');
      setUsers(users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Delete a user
  const handleDeleteUser = async (id: string) => {
    try {
      await deleteRecord('users', id);
      fetchUsers();
      alert('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user. Please try again.');
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>File Storage Demo</CardTitle>
          <CardDescription>
            Upload files to Supabase Storage and manage them
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="file">Select File</Label>
            <Input id="file" type="file" onChange={handleFileChange} />
          </div>
          
          <Button 
            onClick={handleFileUpload} 
            disabled={!file || uploading}
            className="w-full"
          >
            {uploading ? 'Uploading...' : 'Upload File'}
            {!uploading && <Upload className="ml-2 h-4 w-4" />}
          </Button>
          
          <div className="mt-4">
            <h3 className="text-lg font-medium">Your Files</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchFiles} 
              className="mt-2"
            >
              Refresh Files
            </Button>
            
            {uploadedFiles.length > 0 ? (
              <ul className="mt-2 space-y-2">
                {uploadedFiles.map((file) => (
                  <li key={file.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex flex-col">
                      <span className="truncate max-w-[200px]">{file.name}</span>
                      {file.url && (
                        <a 
                          href={file.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-xs text-blue-500 hover:underline"
                        >
                          View File
                        </a>
                      )}
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteFile(file.id, file.path)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">No files found. Upload a file or click refresh.</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Database Demo</CardTitle>
          <CardDescription>
            Create, read, and delete records from the Supabase database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                name="name" 
                value={userData.name} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                value={userData.email} 
                onChange={handleInputChange} 
              />
            </div>
          </div>
          
          <Button 
            onClick={handleSaveUser} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Saving...' : 'Save User Data'}
            {!loading && <Database className="ml-2 h-4 w-4" />}
          </Button>
          
          <div className="mt-4">
            <h3 className="text-lg font-medium">Saved Users</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchUsers} 
              className="mt-2"
            >
              Refresh Users
            </Button>
            
            {users.length > 0 ? (
              <ul className="mt-2 space-y-2">
                {users.map((user) => (
                  <li key={user.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">No users found. Add a user or click refresh.</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            This is a demo of Supabase database operations.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
