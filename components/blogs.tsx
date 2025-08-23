import React, { useEffect } from "react";
import { BuilderComponent } from "../../../../func/builder";
import { faBlog } from "@fortawesome/free-solid-svg-icons";
import useStorage from "../../../../func/hooks/useStorage";
import { BlogCategory, BlogPost } from "../ui";
import { useBuilder } from "../../../../func/hooks/useBuilder";

export const WxBlogsComponent: BuilderComponent = {
    id: "WxBlogs__blogs__type1",
    type: "plugin",
    content: "Blogs",
    plugin: "grid__01",
    pluginSettings: [
      { name: 'Category', value: '', description: 'Filter by category', type: 'string' },            
    ],
    icon: faBlog,
    pluginName: "Blog",
}

interface WxBlogsProps {
  settings: {
    name: string;
    value: string;
    description: string;   
  }[]
}

 
const WxBlogs: React.FC<WxBlogsProps> = (props) => {
    const { getState } = useStorage();
    const { constructPageURL } = useBuilder();

    const [blogs ] = React.useState<BlogPost[]>(getState("Blog")?.posts || []);
    const [searchQuery, setSearchQuery] = React.useState<string>("");
    const [filteredBlogs, setFilteredBlogs] = React.useState<BlogPost[]>([]);

    const [ categories ] = React.useState<BlogCategory[]>([
      {
        name: "All",
        slug: "all"
      },
      ...getState("Blog")?.categories || []
    ]);

    const [ category, setCategory] = React.useState<string>(props.settings[0]?.value || categories[0]?.name || "All");

    useEffect(() => {
        const filtered = blogs.filter(blog => {
            return blog.status === "published" &&
            blog.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
            category === "All" ? blog : blog.category.toLowerCase().replace(' ', '-') === category.toLowerCase().replace(' ', '-');
        });

        setFilteredBlogs(filtered);
    }, [searchQuery, blogs, category]);

    /**
     * handleBlogClick
     * 
     * This function is called when a blog item is clicked. It will navigate to the
     * blog post with the corresponding id.
     * @param {string} id The id of the blog post.
     */
    const handleBlogClick = (id: string) => {
        window.location.href = constructPageURL(`blog/${id}`);
    }

/**
 * SearchEmpty
 * 
 * This component is rendered when there are no blogs matching the current search
 * query or filters. It displays a message with a clear call-to-action to clear
 * the filters and browse all articles. Additionally, it provides some suggested
 * search tips that the user might be interested in.
 * 
 * @returns {JSX.Element} The search empty state component
 */
    const SearchEmpty = () => (        
    <div className="search-empty-state">
        <div className="search-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        </div>
        <h3 className="search-empty-heading">No results found for <span className="search-term">{category}:{searchQuery}</span></h3>
        <p className="search-empty-description">
        We couldn't find any articles matching your search. Try adjusting your search terms or explore our search tips below.
        </p>

        <div className="search-tips">
        <div className="tips-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Search Tips
        </div>
        <ul className="tips-list">
            <li>Check for spelling errors and typos</li>
            <li>Try more general keywords</li>
            <li>Use fewer filters</li>
            <li>Consider similar terms (e.g., "AI" instead of "artificial intelligence")</li>
        </ul>
        </div>

        <div className="search-actions">
        <button className="search-action-button primary-button"
        onClick={() => {
                setSearchQuery("");
                setCategory(categories[0]?.name || "");
            }}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Clear all filters
        </button>
        <button className="search-action-button secondary-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Browse all articles
        </button>
        </div>
  </div>
    )

/**
 * EmptyState
 * 
 * This component is rendered when there are no blogs matching the current search 
 * query or filters. It displays a message with a clear call-to-action to clear
 * the filters and browse all articles. Additionally, it provides some suggested
 * topics that the user might be interested in.
 * 
 * @returns {JSX.Element} The empty state component
 */
    const EmptyState = () => (        
    <div className="empty-state">
        <div className="empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
        </div>
        <h3 className="empty-state-title">No blogs found</h3>
        <p className="empty-state-description">
            We couldn't find any blogs matching your current filters. Try adjusting your search or browse our suggested topics below.
        </p>
        <button className="empty-state-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Clear filters
        </button>
        
        <div className="empty-state-suggestions">
            <h4 className="suggestion-title">Popular topics you might be interested in</h4>
            <div className="suggestion-tags">
            <span className="suggestion-tag">Web Development</span>
            <span className="suggestion-tag">UX Design</span>
            <span className="suggestion-tag">Machine Learning</span>
            <span className="suggestion-tag">Mobile Apps</span>
            <span className="suggestion-tag">Cloud Computing</span>
            </div>
        </div>
      </div>
    )
    return ( 
        <div className="container">
        <div className="filter-section">
          <div className="search-bar">
            <input type="text" placeholder="Search articles..." className="search-input" onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="filter-options">
            <div className="filter-group">
            {categories.map((cat, idx) => (
                <button key={idx} className={`filter-button ${category === cat.name ? 'active' : ''}`} onClick={() => setCategory(cat.name)}>
                  {cat.name}
                </button>
            ))}
            </div>
          </div>
        </div>
    
        <div className="blog-grid">
            {filteredBlogs.map((blog, idx) => (
               <article className="blog-card" id={blog.id} key={idx} onClick={() => handleBlogClick(blog.slug)} style={{cursor: 'pointer'}}>
               <img src={blog.featuredImage} alt="Blog post featured image" className="blog-image" />
               <div className="blog-content">
                 <div className="blog-category">{blog.category}</div>
                 <h2 className="blog-title">{blog.title}</h2>
                 <p className="blog-excerpt">{blog.excerpt}</p>
                 <div className="blog-footer">
                   <div className="blog-author">
                     <div className="author-avatar"></div>
                     <span>{blog.author}</span>
                   </div>
                   <div className="blog-date">{new Date(blog.createdAt).toLocaleDateString()}</div>
                 </div>
               </div>
             </article>
            ))}    
        </div>
        {blogs.length === 0 && <EmptyState />}
        {filteredBlogs.length === 0 && <SearchEmpty />}
      </div>
    
     );
}
 
export default WxBlogs;