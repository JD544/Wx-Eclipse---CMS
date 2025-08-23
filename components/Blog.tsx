import { useRef, useState } from 'react';
import useStorage from '../../../../func/hooks/useStorage';
import { BlogPost, BlogSettings } from '../ui';
import { faNewspaper } from '@fortawesome/free-solid-svg-icons';
import { BuilderComponent } from '../../../../func/builder';
import Sidebar from './sidebar';
import { Editor } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { Save } from 'lucide-react';
import { useBuilder } from '../../../../func/hooks/useBuilder';
import SimpleComments from './Comments';

export const WxBlogComponent: BuilderComponent = {
    id: "WxBlog__blog__type1",
    type: "plugin",
    content: "Blog",
    plugin: "BlogPost",
    icon: faNewspaper,
    pluginSettings: [
      {
        name: 'Show Related Posts',
        type: 'boolean',
        description: 'Show related posts at the end of the blog post',
        value: true
      },
      {
        name: 'Post ID',
        type: 'string',
        description: 'The ID of the blog post to display',
        value: ''
      }
    ],
    
    pluginName: "Blog",
}

const SingleBlogPost = () => {
  const [ showRelated ] = useState(true);
  const [ editing, setEditing ] = useState(false);
  const [ editorValue, setEditorValue ] = useState('');

  const { getComponent, constructPageURL } = useBuilder();

  const { getState, putItemInStore } = useStorage();

  const editorRef = useRef<editor.IStandaloneCodeEditor>();

  const blogPosts: BlogPost[] = getState('Blog')?.posts || [] as BlogPost[];
  const settings: BlogSettings = getState('Blog')?.blogSettings || {} as BlogSettings;

  const blogPost = blogPosts.find(post => post.slug === window.location.pathname.split('/').pop()) || null;


  /**
   * Renders the HTML content of the blog post. If the content contains
   * a script tag, it will be blocked and "Content blocked" will be displayed.
   * @returns The rendered HTML content of the blog post.
   */
  const renderPostHtml = () => {
    if (!blogPost) return null;
    const content = blogPost.content || '';
    const scriptRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    // Block from rendering if script tag is found
    if ( scriptRegex.test(content) ) {
      return (
        <div className='wx-blog-content-blocked'>Content blocked</div>
      )
    } else {
            return (
                <div className='wx-blog-content' dangerouslySetInnerHTML={{ __html: blogPost.content }} />
            )
        }
    }

  /**
   * Handles the drag over event for the blog post content
   * @param e The event of the drag over
   */
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

  }

  /**
   * Handles the drop event for the blog post content
   * @param e The event of the drop
   */

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    
    return handleAddHtml(data);
  }

  /**
   * Handles adding HTML to the blog post content based on the given type
   * @param html type of html to add (title, paragraph, image, quote, code, ul, video, divider)
   */
  const handleAddHtml = (html: string) => {
    if (!editorRef.current) return;
    const defaultClassName = 'wx-blog-element';
    if (html as string === 'title') {
      setEditorValue((prev => prev + `\n<h1 class="${defaultClassName}">Title</h1>`));
    }

    if (html as string === 'paragraph') {
      setEditorValue((prev => prev + '\n<p class="' + defaultClassName + '">Paragraph</p>'));
    }

    if (html as string === 'image') {
      setEditorValue((prev => prev + '\n<img src="/api/placeholder/400/300" alt="Image" class="' + defaultClassName + '">'));
    }

    if (html as string === 'quote') {
      setEditorValue((prev => prev + '\n<blockquote class="' + defaultClassName + '">Quote</blockquote>'));
    }

    if (html as string === 'code') {
      setEditorValue((prev => prev + '\n<pre><code class="' + defaultClassName + '">Code</code></pre>'));
    }

    if (html as string === 'ul') {
      setEditorValue((prev => prev + '\n<ul class="' + defaultClassName + '"><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>'));
    }

    if (html as string === 'video') {
      setEditorValue((prev => prev + '\n<video src="/api/placeholder/400/300" controls class="' + defaultClassName + '"></video>'));
    }

    if (html as string === 'divider') {
      setEditorValue((prev => prev + '\n<hr class="' + defaultClassName + ' wx-divider">'));
    }
  }

  /**
   * This function is called when the user clicks the save button.
   * It first gets the component that the user is currently editing.
   * If the component is not a plugin or the plugin is not the blog plugin, it returns.
   * Now we're certain that the component is a blog plugin.
   * We update the blog post by getting the blog posts from the state store, updating the content of the post we're editing, and putting it back into the state store.
   * Finally, we set editing to false, which means that the user is done editing the blog.
   */
  const handle_save = () => {
    const component = getComponent();

    if (!blogPost) return;
    if (!component) return;
    // We first check if the component is a plugin
    if (component.type !== 'plugin') return;

    // We then check if the plugin is the blog plugin
    if (component.pluginName !== 'Blog') return;

    // Now we're certain that the component is a blog plugin
    // We can update the blog
    // But first, we need to recursively update the blog posts

    // We first get the blog posts
    const blogPosts = getState('Blog')?.posts || [] as BlogPost[];
    const blogState = getState('Blog') || {}

    // We then update the blog posts
    const updatedBlogPosts = blogPosts.map((post: BlogPost) => {
      if (post.id === blogPost.id) {
        return {
          ...post,
          content: editorValue
        }
      }
      return post;
    });

    // We need to put this into state store
    putItemInStore('Blog', { ...blogState, posts: updatedBlogPosts });

    return setEditing(false); // We're now done with editing the blog
  }

  const relatedPosts =
    blogPosts
      .filter(post => post.category === blogPost?.category && post.slug !== blogPost.slug)
      .filter(post => post.status === 'published')
      .slice(0, 3);
  return (
    blogPost && settings && blogPost.status === 'published' ? (
    <div className="wx-blog-container">
      {/* Header */}
      <header className="wx-blog-header">
        <div className="wx-blog-category">{blogPost.category}</div>
        <h1 className="wx-blog-title">{blogPost.title}</h1>
        <div className="wx-blog-author-container">
          <div className="wx-blog-author">
            <img 
              src={"https://placehold.co/600x400/EEE/31343C"} 
              alt={"Author Avatar"}
              className="wx-blog-author-avatar"
            />
            {settings.showAuthor && <span className="wx-blog-author-name">{blogPost.author}</span>}
          </div>
          {settings.showDate && <div className="wx-blog-date">
            {new Date(blogPost.createdAt).toLocaleDateString()}
            {blogPost.updatedAt > blogPost.createdAt && <div className="wx-blog-updated">Updated: {new Date(blogPost.updatedAt).toLocaleDateString()}</div>}</div>}           
        </div>
      </header>

      <div className="wx-blog-edit">
      {import.meta.env.VITE_WX_EDITOR && <button className="wx-blog-edit-button"
          onClick={() => setEditing(!editing)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-edit">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>        
          </svg>          
        </button>
      }
        <Sidebar isOpen={editing} dragOver={handleDragOver} handleDrop={handleDrop} />
      </div>      

      {/* Featured Image */}
      <div className="wx-blog-featured-image-container">
        <img 
          src={blogPost.featuredImage}
          alt={blogPost.title}
          className="wx-blog-featured-image"
        />
      </div>

      {/* Blog Content */}
        <div className="wx-blog-content"
        onDrop={handleDrop}
        >{!editing ? renderPostHtml() : 
        (
          <div className="wx-blog-html-editor">
            {import.meta.env.VITE_WX_EDITOR &&
           <button className="wx-blog-html-editor-save"
            onClick={handle_save}
            aria-label='Save'
            ><Save /></button>
            }
            <Editor
              className='wx-blog-html-editor'
              theme='vs-dark'
              onMount={(editor) => {
                setEditorValue(blogPost.content);
                editorRef.current = editor;
              }}
              onChange={(value) => setEditorValue(value || '')}              
              height="90vh"
              value={editorValue}
              language="html"
            />
          </div>
        )}</div>

      {/* Tags */}
      <div className="wx-blog-tags">
        {blogPost.tags.map(tag => (
          <span 
            key={tag} 
            className="wx-blog-tag"
          >
            #{tag}
          </span>
        ))}
      </div>

      {settings.enableComments && <SimpleComments />}

      {/* Related Posts Section */}
      <div className="wx-blog-related-section">
        {showRelated && (
          <div className="wx-blog-related-grid">
            {relatedPosts && relatedPosts.map(post => (
              <div 
                key={post.id} 
                className="wx-blog-related-card"
                onClick={() => window.location.href = constructPageURL(`blog/${post.slug}`)}
                style={{
                  cursor: 'pointer'
                }}
              >
                <img 
                  src={post.featuredImage} 
                  alt={post.title}
                  className="wx-blog-related-image"
                />
                <div className="wx-blog-related-content">
                  <div className="wx-blog-related-category">{post.category}</div>
                  <h3 className="wx-blog-related-title">{post.title}</h3>
                  <div className="wx-blog-related-meta">
                    <span>{post.author}</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    ) : (
      <div className="wx-blog-container">
        <div className="wx-blog-error"
        style={
          {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            flexDirection: 'column'
          }
        }>
            <h1>Blog Post Not Found</h1>
            <p>The blog post you are looking for does not exist or has been removed.</p>            
            <button className='wx-btn-primary'
            onClick={() => window.location.href = "/"}
            >Go Home</button>
        </div>
      </div>
    )
  );
};

export default SingleBlogPost;