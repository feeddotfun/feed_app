import React from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PlusCircle, ImageIcon } from "lucide-react";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from "react-hook-form";
import { z } from "zod";

const MAX_FILE_SIZE = 2000000;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  name: z.string().min(1, {
  message: "Name is required"
  }).max(32, {
      message: "Name is too long (max 32 characters)"
  }),
  ticker: z.string().min(1, {
      message: "Ticker is required"
  }).max(10, {
      message: "Ticker is too long (max 10 characters)"
  }),
  description: z.string().min(1, {
      message: "Description is required"
  }).max(1000, {
      message: "Description is too long (max 1000 characters)"
  }),
  image: z.instanceof(File).refine((file) => file.size <= MAX_FILE_SIZE, `Max image size is 2MB.`).refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
  )
});

type FormValues = z.infer<typeof formSchema>;

interface AddMemeProps {
  sessionId: string;
  onCreate: (name: string, ticker: string, description: string, image: string) => Promise<void>,
  isCreating: boolean,
}

export default function AddMeme({
  sessionId,
  onCreate,
  isCreating
}: AddMemeProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      ticker: '',
      description: '',
    }
  });

  const uploadImageToCloud = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_UPLOAD_API_URL}?key=${process.env.NEXT_PUBLIC_UPLOAD_API_KEY}`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload image');
    }
    
    const data = await response.json();
    return data.data.url;
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Upload image to Cloud
      const imageUrl = await uploadImageToCloud(values.image);
      
      // Create meme with the uploaded image URL
      await onCreate(
        values.name,
        values.ticker,
        values.description,
        imageUrl
      )
      
      // Reset form and close dialog
      form.reset();
      setPreviewUrl(null);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to create meme:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Update form
      form.setValue('image', file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Card 
        onClick={() => setIsOpen(true)}
        className="border-dashed border-2 border-gray-300 hover:border-primary/50 transition-colors cursor-pointer group h-full"
      >
        <div className="relative aspect-video bg-muted/50 group-hover:bg-muted transition-colors">
          <div className="absolute inset-0 flex items-center justify-center">
            <PlusCircle className="w-12 h-12 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>
        
        <div className="p-6 flex-1 flex flex-col items-center justify-center">
          <span className="font-semibold text-lg mt-2 text-muted-foreground group-hover:text-primary transition-colors">
            Add Meme
          </span>
          <p className="text-sm text-muted-foreground/80 text-center mt-2">
            Create and submit your own meme to join the competition
          </p>
        </div>
      </Card>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Submit a New Meme</DialogTitle>
          <DialogDescription>
            Create your meme and submit it to the current session
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="image"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Meme Image</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                          relative aspect-video rounded-lg border-2 border-dashed
                          ${previewUrl ? 'border-primary/50' : 'border-gray-300'}
                          hover:border-primary/50 transition-colors cursor-pointer
                          flex items-center justify-center bg-muted/50
                        `}
                      >
                        {previewUrl ? (
                          <motion.img
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-full object-contain rounded-lg"
                          />
                        ) : (
                          <div className="text-center space-y-2">
                            <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground" />
                            <div className="text-sm text-muted-foreground">
                              Click to upload your meme image
                            </div>
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                        ref={fileInputRef}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter meme name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ticker"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ticker</FormLabel>
                  <FormControl>
                    <Input placeholder="$MEME" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your meme..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting || isCreating}
                className="min-w-[100px]"
              >
                {(isSubmitting || isCreating) ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Creating...</span>
                  </div>
                ) : (
                  'Create Meme'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};