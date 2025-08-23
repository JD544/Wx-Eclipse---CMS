import React from 'react'

interface Props {
    isOpen: boolean;
    dragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;    
}

function Sidebar(props: Props) {
    const { isOpen } = props;

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, tool: string) => {
        e.dataTransfer.effectAllowed = 'move';        
        e.stopPropagation()
        e.dataTransfer.setData('text/plain', tool);
    }
       
    return (
        <div className={`wx-blog-sidebar edit-blog ${isOpen ? 'open' : ''}`}
        aria-hidden={!isOpen}
        aria-label='sidebar'
        aria-expanded={isOpen}
        >            
                <div className="wx-card-grid wx-blog-tools">
                    <div className="wx-blog-tools-card"
                    onDragStart={(e) => handleDragStart(e, 'title')}                    
                    draggable
                    >
                    {/* Title */}
                    <div className="wx-card-grid-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            className="feather feather-type">
                            <polyline points="4 7 4 4 20 4 20 7" />
                            <line x1="9" y1="20" x2="15" y2="20" />
                            <line x1="12" y1="4" x2="12" y2="20" />
                        </svg>
                    </div>
                    <h3>Title</h3>
                    </div>

                    <div className="wx-blog-tools-card"
                    onDragStart={(e) => handleDragStart(e, 'paragraph')}
                    draggable
                    >                    
                    {/* Paragraph */}
                    <div className="wx-card-grid-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            className="feather feather-align-left">
                            <line x1="17" y1="10" x2="3" y2="10" />
                            <line x1="21" y1="6" x2="3" y2="6" />
                            <line x1="21" y1="14" x2="3" y2="14" />
                            <line x1="17" y1="18" x2="3" y2="18" />
                        </svg>
                    </div>
                    <h3>Paragraph</h3>
                    </div>

                    <div className="wx-blog-tools-card"
                    onDragStart={(e) => handleDragStart(e, 'image')}
                    draggable
                    >
                    {/* Image */}
                    <div className="wx-card-grid-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            className="feather feather-image">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                        </svg>
                    </div>
                    <h3>Image</h3>
                    </div>

                    <div className="wx-blog-tools-card"
                    onDragStart={(e) => handleDragStart(e, 'quote')}
                    draggable
                    >                        
                    {/* Quote */}
                    <div className="wx-card-grid-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            className="feather feather-message-square">
                            <path d="M21 15a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h5l4 4 4-4h5z" />
                        </svg>
                    </div>
                    <h3>Quote</h3>
                    </div>

                    <div className="wx-blog-tools-card"
                    onDragStart={(e) => handleDragStart(e, 'ul')}
                    draggable
                    >
                    {/* List */}
                    <div className="wx-card-grid-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            className="feather feather-list">
                            <line x1="8" y1="6" x2="21" y2="6" />
                            <line x1="8" y1="12" x2="21" y2="12" />
                            <line x1="8" y1="18" x2="21" y2="18" />
                            <line x1="3" y1="6" x2="3" y2="6" />
                            <line x1="3" y1="12" x2="3" y2="12" />
                            <line x1="3" y1="18" x2="3" y2="18" />
                        </svg>
                    </div>
                    <h3>List</h3>
                    </div>

                    <div className="wx-blog-tools-card"
                    onDragStart={(e) => handleDragStart(e, 'video')}
                    draggable
                    >
                    {/* Video */}
                    <div className="wx-card-grid-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            className="feather feather-video">
                            <polygon points="23 7 16 12 23 17 23 7" />
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                        </svg>
                    </div>
                    <h3>Video</h3>
                    </div>

                    <div className="wx-blog-tools-card"
                    onDragStart={(e) => handleDragStart(e, 'divider')}
                    draggable
                    >
                    {/* Divider */}
                    <div className="wx-card-grid-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            className="feather feather-minus">
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </div>
                    <h3>Divider</h3>
                    </div>

                    <div className="wx-blog-tools-card"
                    onDragStart={(e) => handleDragStart(e, 'code')}
                    draggable
                    >
                    {/* Code Block */}
                    <div className="wx-card-grid-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            className="feather feather-code">
                            <polyline points="16 18 22 12 16 6" />
                            <polyline points="8 6 2 12 8 18" />
                        </svg>
                    </div>
                    <h3>Code</h3>
                    </div>
                </div>
            </div>
    )
}

export default Sidebar
