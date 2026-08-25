'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Trash2, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfilePictureUploadProps {
  currentImage?: string;
  onImageChange?: (imageUrl: string) => void;
  userName?: string;
}

export function ProfilePictureUpload({ currentImage, onImageChange, userName = 'User' }: ProfilePictureUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please select a valid image file.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'Image size must be less than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setPreview(imageUrl);
        onImageChange?.(imageUrl);
        toast({
          title: 'Success',
          description: 'Profile picture updated successfully.',
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload profile picture.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onImageChange?.('');
    toast({
      title: 'Success',
      description: 'Profile picture removed.',
    });
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Profile Picture</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-4">
          {/* Current Profile Picture */}
          <div className="relative w-32 h-32 rounded-full overflow-hidden bg-background border-2 border-border flex items-center justify-center">
            {preview ? (
              <Image
                src={preview}
                alt={userName}
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-4xl font-bold text-muted-foreground">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Upload Area */}
          <div className="w-full">
            <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-background/50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {isLoading ? (
                  <>
                    <Loader className="w-8 h-8 text-primary animate-spin mb-2" />
                    <p className="text-sm text-muted-foreground">Uploading...</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 5MB</p>
                  </>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isLoading}
              />
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 w-full">
            {preview && (
              <Button
                variant="destructive"
                className="flex-1 gap-2"
                onClick={handleRemove}
                disabled={isLoading}
              >
                <Trash2 className="w-4 h-4" />
                Remove Picture
              </Button>
            )}
          </div>

          {/* File Info */}
          <p className="text-xs text-muted-foreground text-center">
            Profile pictures are displayed on your account and in the dashboard. Recommended: 500x500px or larger.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
