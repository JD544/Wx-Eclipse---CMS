import React, { useEffect, useRef, useState } from 'react';
import { Modal } from './modal';
import useStorage from '../../../func/hooks/useStorage';
import { Plugin } from '../plugins';
import { useBuilder } from '../../../func/hooks/useBuilder';
import { faBook, faNewspaper } from '@fortawesome/free-solid-svg-icons';
import { BuilderComponent, Media } from '../../../func/builder';
import { Dropdown } from '../../tools/dropdown';
import { WxBlogComponent } from './components/Blog';
import { useAuth } from '../../../func/hooks/useAuth';
import { DefaultBlogPosts } from './Defaults/blogs';

// Define blog post structure
export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  featuredImage: string;
  createdAt: string;
  updatedAt: string;
  slug: string;
}

// Define blog category structure
export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
}

// Define blog stats
interface BlogStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  categories: number;
  comments: number;
}

// Define blog settings
export interface BlogSettings {
  enableComments: boolean;
  moderateComments: boolean;
  postsPerPage: number;
  showAuthor: boolean;
  showDate: boolean;
  allowRatings: boolean;
  defaultCategory: string;
}

// Define our blog components
export const blogList: BuilderComponent = {
  id: 'wx-blog-list',
  type: 'plugin',
  pluginName: 'Blog',
  content: 'Blog List',
  icon: faNewspaper,
  plugin: 'grid__01',
  pluginSettings: [
    { name: 'Category', value: '', description: 'Filter by category', type: 'string' },
    { name: 'PostsPerPage', value: '5', description: 'Number of posts to show', type: 'number' },
    { name: 'ShowExcerpt', value: true, description: 'Show post excerpt', type: 'boolean' },
    { name: 'ShowFeaturedImage', value: true, description: 'Show featured image', type: 'boolean' }
  ]
}

export const blogPost: BuilderComponent = {
  id: 'wx-blog-post',
  type: 'plugin',
  pluginName: 'Blog',
  content: 'Blog Post',
  icon: faBook,
  plugin: 'BlogPost',
  pluginSettings: [
    { name: 'ShowAuthor', value: true, description: 'Show post author', type: 'boolean' },
    { name: 'ShowDate', value: true, description: 'Show post date', type: 'boolean' },
    { name: 'ShowComments', value: true, description: 'Show post comments', type: 'boolean' },
    { name: 'ShowCategories', value: true, description: 'Show post categories', type: 'boolean' }
  ]
}

const BlogDashboard = ({ pluginSettings }: { pluginSettings: Plugin }) => {
  const { addPage, getPages, removePage, addMedia } = useBuilder();
  const { putItemInStore, getState } = useStorage();
  
  const { user } = useAuth();

  // State variables
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    content: React.ReactNode;
  }>({
    isOpen: false,
    title: '',
    content: null
  });

  // Get stored blog data or initialize with defaults
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(
    getState(pluginSettings.name)?.posts as BlogPost[] || DefaultBlogPosts
  );

  const [categories, setCategories] = useState<BlogCategory[]>(
    getState(pluginSettings.name)?.categories as BlogCategory[] || [
      {
        id: '1',
        name: 'Uncategorized',
        slug: 'uncategorized',
        description: 'Default category'
      }
    ]
  );

  const [blogSettings, setBlogSettings] = useState<BlogSettings>(
    getState(pluginSettings.name)?.blogSettings || {
      enableComments: true,
      moderateComments: true,
      postsPerPage: 10,
      showAuthor: true,
      showDate: true,
      allowRatings: false,
      defaultCategory: 'uncategorized'
    }
  );

  // Calculate blog stats
  const [stats] = useState<BlogStats>({
    totalPosts: blogPosts.length,
    publishedPosts: blogPosts.filter(post => post.status === 'published').length,
    draftPosts: blogPosts.filter(post => post.status === 'draft').length,
    categories: categories.length,
    comments: 0
  });

  // Save data to storage when it changes
  useEffect(() => {
    const config = {
      ...getState(pluginSettings.name),
      posts: blogPosts,
      categories: categories,
    };

    putItemInStore(pluginSettings.name, config);
    return () => {};
  }, [blogPosts, categories]);

  // Helper function to create a slug from a title
  const createSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Replace multiple hyphens with a single one
  };

  // Handle adding a new category
  const addNewCategory = (form: React.FormEvent) => {
    form.preventDefault();
    form.stopPropagation();
    
    const name = (form.target as HTMLFormElement).elements.namedItem('name') as HTMLInputElement;
    const description = (form.target as HTMLFormElement).elements.namedItem('description') as HTMLTextAreaElement;
    
    const slug = createSlug(name.value);
    
    // Check if category with this name already exists
    if (categories.find(cat => cat.name.toLowerCase() === name.value.toLowerCase())) {
      alert('A category with this name already exists.');
      return;
    }
    
    // Create new category
    const newCategory: BlogCategory = {
      id: Math.random().toString(36).substring(2, 15),
      name: name.value,
      slug: slug,
      description: description.value
    };
    
    setCategories([...categories, newCategory]);
    closeModal();
  };

  const reGeneratePages = () => {
    blogPosts.forEach(post => {
      addPage({
        id: post.id,
        name: post.title,
        description: post.excerpt,
        url: `blog/${post.slug}`,
        hidden: true,
        components: [
          blogPost
        ]        
      });
      
      addPage({
        id: Math.random().toString(36).substring(2, 15),
        name: 'Blog',
        description: 'Blog list page',
        url: 'blogs',
        components: [
          blogList
        ]
      });
    });
  };

  // Delete a blog post
  const deletePost = (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      setBlogPosts(blogPosts.filter(post => post.id !== postId));
    }

    let page = getPages()?.find(page => page.url === `blog/${postId}`)!;

    if (page) {
      removePage(page);
    }
  };

  // Handle editing a blog post
  const editPost = (post: BlogPost) => {
    setModal({
      isOpen: true,
      title: 'Edit Blog Post',
      content: <EditPostForm post={post} onSubmit={() => closeModal()} onClose={closeModal} categories={categories} />
    });
  };

    const editCategory = (category: BlogCategory) => {
      setModal({
        isOpen: true,
        title: 'Edit Category',
        content: <EditCategoryForm category={category} onSubmit={updateCategory} onClose={closeModal} />
      });
    };

    const openAddPostModal = () => {
      setModal({
        isOpen: true,
        title: 'Add New Blog Post',
        content: <AddPostForm onClose={closeModal} categories={categories} />
      });
    };

    const openAddCategoryModal = () => {
      setModal({
        isOpen: true,
        title: 'Add New Category',
        content: <AddCategoryForm onSubmit={addNewCategory} onClose={closeModal} />
      });
    };


  // Update an existing category
  const updateCategory = (form: React.FormEvent, categoryId: string) => {
    form.preventDefault();
    form.stopPropagation();
    
    const name = (form.target as HTMLFormElement).elements.namedItem('name') as HTMLInputElement;
    const description = (form.target as HTMLFormElement).elements.namedItem('description') as HTMLTextAreaElement;
    
    // Update category
    setCategories(categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          name: name.value,
          description: description.value
        };
      }
      return cat;
    }));
    
    closeModal();
  };

  // Delete a category
  const deleteCategory = (categoryId: string) => {
    // Check if it's the default category
    const category = categories.find(cat => cat.id === categoryId);
    if (category?.slug === blogSettings.defaultCategory) {
      alert('You cannot delete the default category.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this category? Posts in this category will be moved to Uncategorized.')) {
      // Move posts in this category to Uncategorized
      const uncategorized = categories.find(cat => cat.slug === 'uncategorized')?.name || 'Uncategorized';
      
      setBlogPosts(blogPosts.map(post => {
        const categoryToDelete = categories.find(cat => cat.id === categoryId)?.name;
        if (post.category === categoryToDelete) {
          return { ...post, category: uncategorized };
        }
        return post;
      }));
      
      setCategories(categories.filter(cat => cat.id !== categoryId));
    }
  };

  // Handle saving settings
  const saveSettings = (form: React.FormEvent) => {
    form.preventDefault();
    
    const config = {
      categories,
      posts: blogPosts,
      blogSettings: blogSettings
    }

    putItemInStore(pluginSettings.name, config);
  };

  // Close modal
  const closeModal = () => {
    setModal({ isOpen: false, title: '', content: null });
  };

  // Filter blog posts based on search term
  const filteredPosts = blogPosts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Filter categories based on search term
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Render different content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="wx-auth-card">
            <h2 className="wx-auth-section-title">Blog Overview</h2>
            <div className="wx-auth-stats-grid">
              <div className="wx-auth-stat-card">
                <span className="wx-auth-stat-value">{stats.totalPosts}</span>
                <span className="wx-auth-stat-label">Total Posts</span>
              </div>
              <div className="wx-auth-stat-card">
                <span className="wx-auth-stat-value">{stats.publishedPosts}</span>
                <span className="wx-auth-stat-label">Published Posts</span>
              </div>
              <div className="wx-auth-stat-card">
                <span className="wx-auth-stat-value">{stats.draftPosts}</span>
                <span className="wx-auth-stat-label">Draft Posts</span>
              </div>
              <div className="wx-auth-stat-card">
                <span className="wx-auth-stat-value">{stats.categories}</span>
                <span className="wx-auth-stat-label">Categories</span>
              </div>
            </div>
            
            <h3 className="wx-auth-section-title" style={{ marginTop: '2rem' }}>Recent Posts</h3>
            <div className="wx-auth-users-list">
              {blogPosts.slice(0, 5).map(post => (
                <div key={post.id} className="wx-auth-user-item">
                  <div className="wx-auth-user-info">
                    <div className="wx-auth-user-primary">
                      <h3 className="wx-auth-user-name">{post.title}</h3>
                      <span className={`wx-auth-method-badge wx-auth-method-${post.status}`}>
                        {post.status}
                      </span>
                    </div>
                    <div className="wx-auth-user-details">
                      <span>By: {post.author}</span>
                      <span>Category: {post.category}</span>
                      <span className="wx-auth-user-date">Created: {formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'posts':
        return (
          <div className="wx-auth-card">
            <div className="wx-auth-header">
              <h2 className="wx-auth-section-title">Blog Posts</h2>
              <div className="wx-auth-search">
                <input
                  type="text"
                  placeholder="Search posts..."
                  className="wx-auth-search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="wx-auth-button wx-auth-button-action" onClick={openAddPostModal}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
            </div>
            
            <div className="wx-auth-users-list">
              {filteredPosts.length > 0 ? (
                filteredPosts.map(post => (
                  <div key={post.id} className="wx-auth-user-item">
                    <div className="wx-auth-user-info">
                      <div className="wx-auth-user-primary">
                        <h3 className="wx-auth-user-name">{post.title}</h3>
                        <span className={`wx-auth-method-badge wx-auth-method-${post.status}`}>
                          {post.status}
                        </span>
                      </div>
                      <div className="wx-auth-user-details">
                        <span>By: {post.author}</span>
                        <span>Category: {post.category}</span>
                        <span className="wx-auth-user-date">Updated: {formatDate(post.updatedAt)}</span>
                      </div>
                    </div>
                    <div className="wx-auth-user-actions">
                      <button
                        className="wx-auth-icon-button"
                        onClick={() => editPost(post)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                        </svg>
                      </button>
                      <button
                        className="wx-auth-icon-button wx-auth-delete-button"
                        onClick={() => deletePost(post.id)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="wx-auth-empty-state">
                  <p>No posts found. Create your first blog post!</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'categories':
        return (
          <div className="wx-auth-card">
            <div className="wx-auth-header">
              <h2 className="wx-auth-section-title">Categories</h2>
              <div className="wx-auth-search">
                <input
                  type="text"
                  placeholder="Search categories..."
                  className="wx-auth-search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="wx-auth-button wx-auth-button-action" onClick={openAddCategoryModal}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
            </div>
            
            <div className="wx-auth-users-list">
              {filteredCategories.length > 0 ? (
                filteredCategories.map(category => (
                  <div key={category.id} className="wx-auth-user-item">
                    <div className="wx-auth-user-info">
                      <div className="wx-auth-user-primary">
                        <h3 className="wx-auth-user-name">{category.name}</h3>
                        {category.slug === blogSettings.defaultCategory && (
                          <span className="wx-auth-method-badge wx-auth-method-email">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="wx-auth-user-details">
                        <span>Slug: {category.slug}</span>
                        <span>{category.description}</span>
                      </div>
                    </div>
                    <div className="wx-auth-user-actions">
                      <button
                        className="wx-auth-icon-button"
                        onClick={() => editCategory(category)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                        </svg>
                      </button>
                      <button
                        className="wx-auth-icon-button wx-auth-delete-button"
                        onClick={() => deleteCategory(category.id)}
                        disabled={category.slug === 'uncategorized'}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="wx-auth-empty-state">
                  <p>No categories found. Create your first category!</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="wx-auth-card">
            <h2 className="wx-auth-section-title">Blog Settings</h2>
            
            <form onSubmit={saveSettings} className="wx-auth-settings-form">
              <div className="wx-auth-setting-item">
                <div>
                  <h3 className="wx-auth-setting-title">Enable Comments</h3>
                  <p className="wx-auth-setting-description">Allow visitors to comment on blog posts</p>
                </div>
                <div 
                  className={`wx-auth-toggle ${blogSettings.enableComments ? 'active' : 'inactive'}`}
                  onClick={() => setBlogSettings({...blogSettings, enableComments: !blogSettings.enableComments})}
                >
                  <div className={`wx-auth-toggle-handle ${blogSettings.enableComments ? 'active' : 'inactive'}`} />
                  <input 
                    type="checkbox" 
                    name="enableComments"
                    checked={blogSettings.enableComments}
                    onChange={() => {}}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
              
              {blogSettings.enableComments && (
                <div className="wx-auth-setting-item">
                  <div>
                    <h3 className="wx-auth-setting-title">Moderate Comments</h3>
                    <p className="wx-auth-setting-description">Review comments before they are published</p>
                  </div>
                  <div 
                    className={`wx-auth-toggle ${blogSettings.moderateComments ? 'active' : 'inactive'}`}
                    onClick={() => setBlogSettings({...blogSettings, moderateComments: !blogSettings.moderateComments})}
                  >
                    <div className={`wx-auth-toggle-handle ${blogSettings.moderateComments ? 'active' : 'inactive'}`} />
                    <input 
                      type="checkbox" 
                      name="moderateComments"
                      checked={blogSettings.moderateComments}
                      onChange={() => {}}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
              )}
              
              <div className="wx-auth-setting-item">
                <div>
                  <h3 className="wx-auth-setting-title">Show Author</h3>
                  <p className="wx-auth-setting-description">Display author name on blog posts</p>
                </div>
                <div 
                  className={`wx-auth-toggle ${blogSettings.showAuthor ? 'active' : 'inactive'}`}
                  onClick={() => setBlogSettings({...blogSettings, showAuthor: !blogSettings.showAuthor})}
                >
                  <div className={`wx-auth-toggle-handle ${blogSettings.showAuthor ? 'active' : 'inactive'}`} />
                  <input 
                    type="checkbox" 
                    name="showAuthor"
                    checked={blogSettings.showAuthor}
                    onChange={() => {}}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
              
              <div className="wx-auth-setting-item">
                <div>
                  <h3 className="wx-auth-setting-title">Show Date</h3>
                  <p className="wx-auth-setting-description">Display publish date on blog posts</p>
                </div>
                <div 
                  className={`wx-auth-toggle ${blogSettings.showDate ? 'active' : 'inactive'}`}
                  onClick={() => setBlogSettings({...blogSettings, showDate: !blogSettings.showDate})}
                >
                  <div className={`wx-auth-toggle-handle ${blogSettings.showDate ? 'active' : 'inactive'}`} />
                  <input 
                    type="checkbox" 
                    name="showDate"
                    checked={blogSettings.showDate}
                    onChange={() => {}}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
              
              <div className="wx-auth-setting-item">
                <div>
                  <h3 className="wx-auth-setting-title">Allow Ratings</h3>
                  <p className="wx-auth-setting-description">Let visitors rate blog posts</p>
                </div>
                <div 
                  className={`wx-auth-toggle ${blogSettings.allowRatings ? 'active' : 'inactive'}`}
                  onClick={() => setBlogSettings({...blogSettings, allowRatings: !blogSettings.allowRatings})}
                >
                  <div className={`wx-auth-toggle-handle ${blogSettings.allowRatings ? 'active' : 'inactive'}`} />
                  <input 
                    type="checkbox" 
                    name="allowRatings"
                    checked={blogSettings.allowRatings}
                    onChange={() => {}}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
              {/* Fix pages button */}
              <div className="wx-auth-setting-item">
                <div>
                  <h3 className="wx-auth-setting-title">Fix Pages</h3>
                  <p className="wx-auth-setting-description">Adds the missing pages back in your website</p>                  
                </div>
                <button
                  className="wx-auth-button wx-auth-button-primary" 
                  onClick={(e) => {
                    e.preventDefault();
                    reGeneratePages();
                  }}
                  >
                    Re-generate Pages
                  </button>
              </div>

              <div className="wx-auth-field">
                <label className="wx-auth-label">Posts Per Page</label>
                <input 
                  type="number" 
                  className="wx-auth-input" 
                  name="postsPerPage"
                  min="1"
                  max="50"
                  value={blogSettings.postsPerPage}
                  onChange={(e) => setBlogSettings({...blogSettings, postsPerPage: parseInt(e.target.value)})}
                />
              </div>
              
              <div className="wx-auth-field">
                <label className="wx-auth-label">Default Category</label>
                <Dropdown
                    options={categories.map(category => ({
                        label: category.name,
                        value: category.slug
                    }))}
                    value={blogSettings.defaultCategory}
                    onChange={(value) => setBlogSettings({...blogSettings, defaultCategory: value})}
                    placeholder='Select a category'                
                />
              </div>
              
              <div className="wx-auth-modal-actions">
                <button type="submit" className="wx-auth-button">
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

const AddPostForm = ({ onClose, categories }: { 
  onClose: () => void,
  categories: BlogCategory[]
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [ category, setCategory ] = useState<string>(categories[0].name);


  // Status state
  const [status, setStatus] = useState<'Draft' | 'Published' | 'Scheduled'>('Draft');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  };

  // Handle file selection from input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFile(file);
    }
  };

  // Process the selected file
  const handleFile = (file: File) => {
    // Only accept image files
    if (!file.type.match('image.*')) {
      alert('Please select an image file');
      return;
    }
    
    // Create a preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && e.target.result) {
        setImagePreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Remove the selected image
  const removeImage = () => {
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Custom form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;
    
    // Validate form fields
    if (!category) {
      alert('Please select a category');
      return;
    }

    if (!imagePreview) {
      alert('Please select an image');
      return;
    }

    const formData = new FormData(e.target as HTMLFormElement);
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const excerpt = formData.get('excerpt') as string;

    if (!title || !content) {
      alert('Please fill in all fields');
      return;
    }

    const media: Media = {
      id: `post_${title}_${Date.now()}`,
      title: title,
      date: new Date().toISOString(),
      url: imagePreview,
      type: 'image',
      alt: 'Post Image',
    };

    // Adding the media to wx explorer
    const imagePreviewUrl = await addMedia(media);
    
    if (imagePreview) {
      const featuredImageInput = (e.target as HTMLFormElement).elements.namedItem('featuredImage') as HTMLInputElement;
      featuredImageInput.value = imagePreview;
    }  

    const post: BlogPost = {
      id: `post_${title}_${Date.now()}`,
      title: title,
      content: content,
      excerpt: excerpt,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      category: category,
      tags: (formData.get('tags') as string).split(',').map(tag => tag.trim()),
      status: status.toLowerCase() as 'draft' | 'published' | 'archived',
      featuredImage: imagePreviewUrl || '',
      slug: createSlug(title),           
      author: user.firstName ? `${user.firstName} ${user.lastName}` : user.email
  };

    setBlogPosts((prevPosts) => [...prevPosts, post]);

    addPage({
      id: post.id,
      name: post.title,
      url: `blog/${post.slug}`,
      hidden: true,
      components: [
        WxBlogComponent,
      ],
      description: post.excerpt,
    })

     onClose();
  };


  return (
    <form onSubmit={handleSubmit} className="wx-auth-modal-form">
      
      <div className="wx-auth-field">
        <label className="wx-auth-label">Featured Image</label>
        
        {/* Hidden input for the image URL (will be set programmatically) */}
        <input type="hidden" className="wx-auth-input" name="featuredImage" />
        
        {/* Image preview area */}
        {imagePreview ? (
          <div className="wx-auth-image-preview">
            <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px' }} />
            <button
              type="button"
              className="wx-auth-button wx-auth-button-secondary"
              onClick={removeImage}
              style={{ marginTop: '10px' }}
            >
              Remove Image
            </button>
          </div>
        ) : (
          <div
            className={`wx-auth-dropzone ${dragActive ? 'active' : ''}`}
            onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
            onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); }}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed #ccc',
              borderRadius: '4px',
              padding: '20px',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: dragActive ? '#f0f0f0' : 'transparent'
            }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{ marginBottom: '10px' }}
            >
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path>
              <line x1="16" y1="5" x2="22" y2="5"></line>
              <line x1="19" y1="2" x2="19" y2="8"></line>
              <circle cx="9" cy="9" r="2"></circle>
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
            </svg>
            <p>Drag & drop an image here, or click to select</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>
        )}
      </div>
      
      <div className="wx-auth-field">
        <label className="wx-auth-label">Title</label>
        <input type="text" className="wx-auth-input" name="title" required />
      </div>
      
      <div className="wx-auth-field">
        <label className="wx-auth-label">Content</label>
        <textarea className="wx-auth-input" name="content" rows={10} required></textarea>
      </div>
      
      <div className="wx-auth-field">
        <label className="wx-auth-label">Excerpt</label>
        <textarea className="wx-auth-input" name="excerpt" rows={3}></textarea>
      </div>
      
      <div className="wx-auth-field">
        <label className="wx-auth-label">Category</label>
        <Dropdown
          options={categories.map(category => ({
            label: category.name,
            value: category.slug
          }))}
          value={category}
          onChange={(value) => setCategory(value)}
          placeholder='Select a category'
        />
      </div>
      
      <div className="wx-auth-field">
        <label className="wx-auth-label">Tags (comma separated)</label>
        <input type="text" className="wx-auth-input" name="tags" placeholder="technology, news, tutorial" />
      </div>
      
      <div className="wx-auth-field">
        <label className="wx-auth-label">Status</label>
        <Dropdown
        options={[
            { label: 'Draft', value: 'draft' },
            { label: 'Published', value: 'published' },
            { label: 'Archived', value: 'archived' },
          ]}
          value={status}
          onChange={(value) => setStatus(value as 'Draft' | 'Published' | 'Scheduled')}
          placeholder='Select a status'
          />
      </div>
      
      <div className="wx-auth-modal-actions">
        <button type="button" className="wx-auth-button wx-auth-button-secondary" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="wx-auth-button">
          Add Post
        </button>
      </div>
    </form>
  );
};


  const EditPostForm = ({ post, onSubmit, onClose, categories }: { 
    post: BlogPost,
    onSubmit: () => void, 
    onClose: () => void,
    categories: BlogCategory[]
  }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);  
    const [ imagePreview, setImagePreview ] = useState<string>(post.featuredImage || '');
    const [ dragActive, setDragActive ] = useState<boolean>(false);
    const [ category, setCategory ] = useState<string>(post.category);
    const [ status, setStatus ] = useState<'draft' | 'published' | 'archived'>(post.status);

    const removeImage = () => {
      setImagePreview('');
    };
    
    // Handle file drop
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        handleFile(file);
      }
    };

    // Handle file selection from input
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        handleFile(file);
      }
    };

    // Process the selected file
    const handleFile = (file: File) => {
      // Only accept image files
      if (!file.type.match('image.*')) {
        alert('Please select an image file');
        return;
      }
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          setImagePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    };

    /**
     * Updates the blog post with the given values
     * @param {React.FormEvent} e The form event
     */
    const UpdatePost = (e: React.FormEvent) => {
      e.preventDefault();

      const formData = new FormData(e.target as HTMLFormElement);
      const title = formData.get('title') as string;    
      const excerpt = formData.get('excerpt') as string;
      const tags = formData.get('tags')?.toString().split(',') as string[];      
     
        setBlogPosts(blogPosts.map(blogPost => {
            if (blogPost.id === post.id) {
              return {
                ...blogPost,
                title,
                excerpt,
                tags,
                status,
                slug: createSlug(title),
                featuredImage: imagePreview,
                category,
                updatedAt: new Date().toISOString(),
              }
            } else {
              return blogPost
            }
        }))

       onSubmit();
       return;
    }

    return (
      <form onSubmit={UpdatePost} className="wx-auth-modal-form">
        <div className="wx-auth-field">
          <label className="wx-auth-label">Featured Image</label>
          
          {/* Hidden input for the image URL (will be set programmatically) */}
          <input type="hidden" className="wx-auth-input" name="featuredImage" />
          
          {/* Image preview area */}
          {imagePreview ? (
            <div className="wx-auth-image-preview">
              <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px' }} />
              <button
                type="button"
                className="wx-auth-button wx-auth-button-secondary"
                onClick={removeImage}
                style={{ marginTop: '10px' }}
              >
                Remove Image
              </button>
            </div>
          ) : (
            <div
              className={`wx-auth-dropzone ${dragActive ? 'active' : ''}`}
              onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
              onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); }}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed #ccc',
                borderRadius: '4px',
                padding: '20px',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: dragActive ? '#f0f0f0' : 'transparent'
              }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{ marginBottom: '10px' }}
              >
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path>
                <line x1="16" y1="5" x2="22" y2="5"></line>
                <line x1="19" y1="2" x2="19" y2="8"></line>
                <circle cx="9" cy="9" r="2"></circle>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
              </svg>
              <p>Drag & drop an image here, or click to select</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          )}
        </div>
        
        <div className="wx-auth-field">
          <label className="wx-auth-label">Title</label>
          <input type="text" className="wx-auth-input" name="title" defaultValue={post.title} required />
        </div>
        
        <div className="wx-auth-field">
          <label className="wx-auth-label">Excerpt</label>
          <textarea className="wx-auth-input" name="excerpt" rows={3} defaultValue={post.excerpt}></textarea>
        </div>
        
        <div className="wx-auth-field">
        <label className="wx-auth-label">Category</label>
        <Dropdown
          options={categories.map(category => ({
            label: category.name,
            value: category.slug
          }))}
          value={category}
          onChange={(value) => setCategory(value)}
          placeholder='Select a category'
        />
      </div>
        
         <div className="wx-auth-field">
          <label className="wx-auth-label">Tags (comma separated)</label>
          <input type="text" className="wx-auth-input" name="tags" defaultValue={post.tags.join(', ')} />
        </div> 
        
         <div className="wx-auth-field">
          <label className="wx-auth-label">Status</label>
          <Dropdown
         options={[
          { label: 'Draft', value: 'draft' },
          { label: 'Published', value: 'published' },
          { label: 'Archived', value: 'archived' },
        ]}
          value={status}
          onChange={(value) => setStatus(value as 'draft' | 'published' | 'archived')}
          placeholder='Select a Status'
        />
        </div>
        
        <div className="wx-auth-modal-actions">
          <button type="button" className="wx-auth-button wx-auth-button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="wx-auth-button">
            Update Post
          </button>
        </div>
      </form>
    );
  };

  // Add Category Form Component
  const AddCategoryForm = ({ onSubmit, onClose }: { 
    onSubmit: (e: React.FormEvent) => void, 
    onClose: () => void 
  }) => {
    return (
      <form onSubmit={onSubmit} className="wx-auth-modal-form">
        <div className="wx-auth-field">
          <label className="wx-auth-label">Name</label>
          <input type="text" className="wx-auth-input" name="name" required />
        </div>
        
        <div className="wx-auth-field">
          <label className="wx-auth-label">Description</label>
          <textarea className="wx-auth-input" name="description" rows={3}></textarea>
        </div>
        
        <div className="wx-auth-modal-actions">
          <button type="button" className="wx-auth-button wx-auth-button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="wx-auth-button">
            Add Category
          </button>
        </div>
      </form>
    );
  };

  // Edit Category Form Component
  const EditCategoryForm = ({ category, onSubmit, onClose }: { 
    category: BlogCategory,
    onSubmit: (e: React.FormEvent, categoryId: string) => void, 
    onClose: () => void 
  }) => {
    return (
      <form onSubmit={(e) => onSubmit(e, category.id)} className="wx-auth-modal-form">
        <div className="wx-auth-field">
          <label className="wx-auth-label">Name</label>
          <input 
            type="text" 
            className="wx-auth-input" 
            name="name" 
            defaultValue={category.name} 
            required 
            disabled={category.slug === 'uncategorized'}
          />
        </div>
        
        <div className="wx-auth-field">
          <label className="wx-auth-label">Description</label>
          <textarea 
            className="wx-auth-input" 
            name="description" 
            rows={3} 
            defaultValue={category.description}
          ></textarea>
        </div>
        
        <div className="wx-auth-modal-actions">
          <button type="button" className="wx-auth-button wx-auth-button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="wx-auth-button">
            Update Category
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="wx-auth-container">
      <div className="wx-auth-topbar">
        <h1 className="wx-auth-title">Blog Manager</h1>
        <button className="wx-auth-button wx-auth-button-secondary">Documentation</button>
      </div>

      <div className="wx-auth-content">
        <div className="wx-auth-sidebar">
          <nav className="wx-auth-menu">
            <div
              className={`wx-auth-menu-item ${activeSection === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveSection('overview')}
            >
              Overview
            </div>
            <div
              className={`wx-auth-menu-item ${activeSection === 'posts' ? 'active' : ''}`}
              onClick={() => setActiveSection('posts')}
            >
              Posts
            </div>
            <div
              className={`wx-auth-menu-item ${activeSection === 'categories' ? 'active' : ''}`}
              onClick={() => setActiveSection('categories')}
            >
              Categories
            </div>
            <div
              className={`wx-auth-menu-item ${activeSection === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveSection('settings')}
            >
              Settings
            </div>
          </nav>
        </div>

        <main className="wx-auth-main">
          {renderContent()}
        </main>
      </div>
      
      <Modal 
        isOpen={modal.isOpen} 
        onClose={closeModal} 
        title={modal.title}
      >
        {modal.content}
      </Modal>
    </div>
  );
};

export default BlogDashboard;