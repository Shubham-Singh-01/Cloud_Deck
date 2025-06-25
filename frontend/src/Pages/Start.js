import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  Trash2, Upload, FileText, Search, Filter, Grid, List, Download, Eye, Edit,
  Share, Star, StarOff, Clock, Calendar, FolderPlus, Tag, X, ChevronDown,
  Loader, AlertCircle, CheckCircle, Info, Settings, Users, Lock, FilePlus2,
  FileSymlink, MoreHorizontal, AlertTriangle, FolderOpen, MessageCircle,
} from 'lucide-react';
import '../Styles/Start.css';
import api from '../utils/api' // Import centralized API instance
import AuthContext from '../Context/Auth/AuthContext';

const Start = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showActivityFeed, setShowActivityFeed] = useState(false);
  const [activeFolder, setActiveFolder] = useState('All Files');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('dateDesc');
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [notification, setNotification] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [showFileDetails, setShowFileDetails] = useState(false);
  const [folders, setFolders] = useState([]);
  const [showNewTagModal, setShowNewTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [availableTags, setAvailableTags] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isUploadDropzoneActive, setIsUploadDropzoneActive] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [showMoreMenu, setShowMoreMenu] = useState(null);

  const fileInputRef = useRef(null);
  const uploadDropzoneRef = useRef(null);

  const API_URL = process.env.REACT_APP_API_URL + '/api/uploads';

  // Fetch documents on mount
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await api.get(`${API_URL}/filter`);
        const documentsData = response.data || []; // Ensure it's always an array
        setDocuments(documentsData);

        // Extract unique folders and tags - safely handle arrays
        const uniqueFolders = [
          ...new Set(documentsData.map((doc) => doc.folder)),
        ].map((name, index) => ({ id: String(index + 1), name, count: 0 }));
        setFolders(uniqueFolders);

        const uniqueTags = [
          ...new Set(documentsData.flatMap((doc) => doc.tags || [])), // Handle missing tags
        ];
        setAvailableTags(uniqueTags);
      } catch (error) {
        console.error('Error fetching documents:', error);
        setDocuments([]); // Ensure documents is always an array
        showNotification('error', 'Failed to fetch documents');
      }
    };
    if (isAuthenticated) {
      fetchDocuments();
    }
  }, [isAuthenticated, API_URL]);

  // Filter and sort documents
  useEffect(() => {
    const fetchFilteredDocuments = async () => {
      try {
        const params = new URLSearchParams({
          search: searchTerm,
          folder: activeFolder,
          tags: selectedTags.join(','),
          sortBy,
        });
        const response = await api.get(`${API_URL}/filter?${params}`);
        const documentsData = response.data || []; // Ensure it's always an array
        setDocuments(documentsData);
      } catch (error) {
        console.error('Error fetching filtered documents:', error);
        setDocuments([]); // Ensure documents is always an array
        showNotification('error', 'Failed to fetch documents');
      }
    };
    if (isAuthenticated) {
      fetchFilteredDocuments();
    }
  }, [searchTerm, activeFolder, selectedTags, sortBy, isAuthenticated, API_URL]);

  // Filter documents (client-side for UI responsiveness)
  const filteredDocuments = (documents || []).filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFolder = activeFolder === 'All Files' || doc.folder === activeFolder;
    const matchesTags =
      selectedTags.length === 0 || selectedTags.every((tag) => doc.tags.includes(tag));
    return matchesSearch && matchesFolder && matchesTags;
  });

  // Sort documents (client-side fallback)
  const sortedDocuments = [...(filteredDocuments || [])].sort((a, b) => {
    switch (sortBy) {
      case 'nameAsc':
        return a.name.localeCompare(b.name);
      case 'nameDesc':
        return b.name.localeCompare(a.name);
      case 'dateAsc':
        return new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
      case 'dateDesc':
        return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
      case 'sizeAsc':
        return parseFloat(a.size) - parseFloat(b.size);
      case 'sizeDesc':
        return parseFloat(b.size) - parseFloat(a.size);
      default:
        return 0;
    }
  });

  // Handle file upload
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });

      try {
        const response = await api.post(`${API_URL}/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        });

        const newDocuments = response.data.documents || [];
        const currentDocuments = documents || [];
        setDocuments([...newDocuments, ...currentDocuments]);

        setActivities([
          ...newDocuments.map((doc) => ({
            id: String(activities.length + 1),
            action: 'uploaded',
            document: doc.name,
            user: user?.name || 'Current User',
            time: 'just now',
          })),
          ...activities,
        ]);
        showNotification('success', 'Files uploaded successfully');


        // Update folders
        const allDocuments = [...currentDocuments, ...newDocuments];
        const uniqueFolders = [
          ...new Set(allDocuments.map((doc) => doc.folder)),
        ].map((name, index) => ({ id: String(index + 1), name, count: 0 }));
        setFolders(uniqueFolders);

        // Update tags
        const uniqueTags = [
          ...new Set(allDocuments.flatMap((doc) => doc.tags || [])),
        ];
        setAvailableTags(uniqueTags);
      } catch (error) {
        console.error('Upload error:', error);
        showNotification('error', 'Failed to upload files');
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    }
  };

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    setIsUploadDropzoneActive(false);
    if (uploadDropzoneRef.current) {
      uploadDropzoneRef.current.focus();
    }
    if (e.dataTransfer.files.length > 0) {
      const fileInput = fileInputRef.current;
      if (fileInput) {
        fileInput.files = e.dataTransfer.files;
        handleFileUpload({ target: { files: e.dataTransfer.files } });
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsUploadDropzoneActive(true);
  };

  const handleDragLeave = () => {
    setIsUploadDropzoneActive(false);
  };

  // Delete document
  const deleteDocument = async (id) => {
    try {
      const response = await api.delete(`${API_URL}/${id}`);
      setDocuments(documents.filter((doc) => doc._id !== id));
      setActivities([
        {
          id: String(activities.length + 1),
          action: 'deleted',
          document: documents.find((doc) => doc._id === id)?.name,
          user: user?.name || 'Current User',
          time: 'just now',
        },
        ...activities,
      ]);
      showNotification('info', response.data.message);
    } catch (error) {
      showNotification('error', 'Failed to delete document');
    }
  };

  // Download document
  const downloadDocument = async (id, name) => {
    try {
      const response = await api.get(`${API_URL}/download/${id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showNotification('success', 'File downloaded');
    } catch (error) {
      showNotification('error', 'Failed to download file');
    }
  };

  // Update document (e.g., favorite, tags)
  const updateDocument = async (id, updates) => {
    try {
      const response = await api.put(`${API_URL}/${id}`, updates);
      setDocuments(
        documents.map((doc) =>
          doc._id === id ? response.data.document : doc
        )
      );
      showNotification('success', 'Document updated');
    } catch (error) {
      showNotification('error', 'Failed to update document');
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action) => {
    if (selectedDocuments.length === 0) return;

    switch (action) {
      case 'delete':
        const docNames = selectedDocuments.map(
          (id) => documents.find((doc) => doc._id === id)?.name
        );
        try {
          await Promise.all(
            selectedDocuments.map((id) => api.delete(`${API_URL}/${id}`))
          );
          setDocuments(documents.filter((doc) => !selectedDocuments.includes(doc._id)));
          showNotification('info', `${selectedDocuments.length} documents deleted`);
          setActivities([
            {
              id: String(activities.length + 1),
              action: 'deleted multiple documents',
              document: docNames.filter(Boolean).join(', '),
              user: user?.name || 'Current User',
              time: 'just now',
            },
            ...activities,
          ]);
        } catch (error) {
          showNotification('error', 'Failed to delete documents');
        }
        break;
      case 'favorite':
        try {
          await Promise.all(
            selectedDocuments.map((id) => updateDocument(id, { favorite: true }))
          );
          showNotification('success', `${selectedDocuments.length} documents marked as favorite`);
        } catch (error) {
          showNotification('error', 'Failed to update documents');
        }
        break;
      case 'unfavorite':
        try {
          await Promise.all(
            selectedDocuments.map((id) => updateDocument(id, { favorite: false }))
          );
          showNotification('info', `${selectedDocuments.length} documents removed from favorites`);
        } catch (error) {
          showNotification('error', 'Failed to update documents');
        }
        break;
      default:
        break;
    }

    setSelectedDocuments([]);
    setShowBulkActions(false);
  };

  // Toggle document selection
  const toggleDocumentSelection = (id) => {
    if (selectedDocuments.includes(id)) {
      setSelectedDocuments(selectedDocuments.filter((docId) => docId !== id));
      if (selectedDocuments.length === 1) {
        setShowBulkActions(false);
      }
    } else {
      setSelectedDocuments([...selectedDocuments, id]);
      setShowBulkActions(true);
    }
  };

  // Toggle all documents
  const toggleAllDocuments = () => {
    if (selectedDocuments.length === sortedDocuments.length) {
      setSelectedDocuments([]);
      setShowBulkActions(false);
    } else {
      setSelectedDocuments(sortedDocuments.map((doc) => doc._id));
      setShowBulkActions(true);
    }
  };

  // Toggle favorite
  const toggleFavorite = async (id) => {
    const doc = documents.find((d) => d._id === id);
    if (doc) {
      await updateDocument(id, { favorite: !doc.favorite });
      setActivities([
        {
          id: String(activities.length + 1),
          action: doc.favorite ? 'removed from favorites' : 'marked as favorite',
          document: doc.name,
          user: user?.name || 'Current User',
          time: 'just now',
        },
        ...activities,
      ]);
    }
  };

  // Create new folder
  const createNewFolder = () => {
    if (newFolderName.trim()) {
      const newFolder = {
        id: String(folders.length + 1),
        name: newFolderName.trim(),
        count: 0,
      };

      setFolders([...folders, newFolder]);
      setNewFolderName('');
      setShowNewFolderModal(false);
      showNotification('success', `Folder "${newFolderName}" created`);
    }
  };

  // Create new tag
  const createNewTag = () => {
    if (newTagName.trim() && !availableTags.includes(newTagName.trim())) {
      setAvailableTags([...availableTags, newTagName.trim()]);
      setNewTagName('');
      setShowNewTagModal(false);
      showNotification('success', `Tag "${newTagName}" created`);
    }
  };

  // Add tag to document
  const addTagToDocument = async (docId, tag) => {
    const doc = documents.find((d) => d._id === docId);
    if (doc && !doc.tags.includes(tag)) {
      const updatedTags = [...doc.tags, tag];
      await updateDocument(docId, { tags: updatedTags });
      if (!availableTags.includes(tag)) {
        setAvailableTags([...availableTags, tag]);
      }
    }
  };

  // Remove tag from document
  const removeTagFromDocument = async (docId, tag) => {
    const doc = documents.find((d) => d._id === docId);
    if (doc) {
      const updatedTags = doc.tags.filter((t) => t !== tag);
      await updateDocument(docId, { tags: updatedTags });
    }
  };

  // Toggle tag selection
  const toggleTagSelection = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Show notification
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Open file preview
  const openFilePreview = (file) => {
    setPreviewFile(file);
    setShowPreviewModal(true);
  };

  // View file details
  const viewFileDetails = (file) => {
    setSelectedFile(file);
    setShowFileDetails(true);
  };

  // Get file icon
  const getFileIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return (
          <div className="file-icon pdf">
            <FileText size={24} />
          </div>
        );
      case 'docx':
      case 'doc':
        return (
          <div className="file-icon doc">
            <FileText size={24} />
          </div>
        );
      case 'xlsx':
      case 'xls':
        return (
          <div className="file-icon xls">
            <FileText size={24} />
          </div>
        );
      case 'pptx':
      case 'ppt':
        return (
          <div className="file-icon ppt">
            <FileText size={24} />
          </div>
        );
      case 'zip':
      case 'rar':
        return (
          <div className="file-icon zip">
            <FileText size={24} />
          </div>
        );
      default:
        return (
          <div className="file-icon default">
            <FileText size={24} />
          </div>
        );
    }
  };

  // Get permission badge
  const getPermissionBadge = (permission) => {
    switch (permission) {
      case 'owner':
        return <span className="permission-badge owner">Owner</span>;
      case 'editor':
        return <span className="permission-badge editor">Editor</span>;
      case 'viewer':
        return <span className="permission-badge viewer">Viewer</span>;
      default:
        return null;
    }
  };

  // Handle settings
  const handleSettings = () => {
    alert('Settings menu opened (implement your settings logic here)');
  };

  // Create new document
  const createNewDocument = () => {
    alert('Create new document (implement your logic here)');
  };

  // Create file link
  const createFileLink = (docId) => {
    alert(`Created link for document ${docId} (implement your logic here)`);
  };

  // Handle more menu
  const handleMoreMenu = (docId, action) => {
    switch (action) {
      case 'rename':
        alert(`Rename document ${docId}`);
        break;
      case 'move':
        alert(`Move document ${docId}`);
        break;
      case 'versionHistory':
        alert(`View version history for document ${docId}`);
        break;
      default:
        break;
    }
    setShowMoreMenu(null);
  };

  return (
    <div
      className="dashboard-container"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
    >
      {/* Upload Dropzone Overlay */}
      {isUploadDropzoneActive && (
        <div ref={uploadDropzoneRef} className="upload-dropzone" tabIndex={-1}>
          <div className="dropzone-content">
            <Upload size={48} className="dropzone-icon" />
            <h3 className="dropzone-title">Drop files to upload</h3>
            <p className="dropzone-text">Release to upload your documents</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="header">
        <div className="header-container">
          <div className="header-left">
            <button
              className="sidebar-toggle"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <List size={20} />
            </button>
            <h1 className="header-title">Document Storage</h1>
          </div>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search documents..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={18} className="search-icon" />
          </div>
          <div className="header-actions">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".doc,.docx,.pdf,.xlsx,.xls,.pptx,.ppt,.zip,.rar"
              multiple
            />
            <label
              htmlFor="file-upload"
              className={`upload-button ${uploading ? 'uploading' : ''}`}
            >
              {uploading ? (
                <Loader size={16} className="loader-icon" />
              ) : (
                <Upload size={16} className="icon" />
              )}
              {uploading ? `Uploading... ${uploadProgress}%` : 'Upload Files'}
            </label>
            <button
              className="new-folder-button"
              onClick={() => setShowNewFolderModal(true)}
            >
              <FolderPlus size={16} className="icon" />
              New Folder
            </button>
            <button className="new-document-button" onClick={createNewDocument}>
              <FilePlus2 size={16} className="icon" />
              New Document
            </button>
            <button className="settings-button" onClick={handleSettings}>
              <Settings size={16} className="icon" />
              Settings
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        {/* Sidebar */}
        {showSidebar && (
          <aside className="sidebar">
            <nav className="sidebar-nav">
              <div className="sidebar-section">
                <h2 className="sidebar-section-title">Storage</h2>
                <div className="sidebar-items">
                  <button
                    className={`sidebar-item ${activeFolder === 'All Files' ? 'active' : ''}`}
                    onClick={() => setActiveFolder('All Files')}
                  >
                    <FileText size={16} className="icon" />
                    All Files
                  </button>
                  <button
                    className={`sidebar-item ${activeFolder === 'Recent' ? 'active' : ''}`}
                    onClick={() => setActiveFolder('Recent')}
                  >
                    <Clock size={16} className="icon" />
                    Recent
                  </button>
                  <button
                    className={`sidebar-item ${activeFolder === 'Favorites' ? 'active' : ''}`}
                    onClick={() => setActiveFolder('Favorites')}
                  >
                    <Star size={16} className="icon" />
                    Favorites
                  </button>
                  <button
                    className={`sidebar-item ${activeFolder === 'Shared' ? 'active' : ''}`}
                    onClick={() => setActiveFolder('Shared')}
                  >
                    <Users size={16} className="icon" />
                    Shared
                  </button>
                </div>
              </div>

              <div className="sidebar-section">
                <h2 className="sidebar-section-title">Folders</h2>
                <div className="sidebar-items">
                  {folders.map((folder) => (
                    <button
                      key={folder.id}
                      className={`sidebar-item folder ${activeFolder === folder.name ? 'active' : ''}`}
                      onClick={() => setActiveFolder(folder.name)}
                    >
                      <div className="folder-name">
                        <FolderOpen size={16} className="icon" />
                        {folder.name}
                      </div>
                      <span className="folder-count">{folder.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="sidebar-section">
                <div className="tags-header">
                  <h2 className="sidebar-section-title">Tags</h2>
                  <button
                    className="add-tag-button"
                    onClick={() => setShowNewTagModal(true)}
                  >
                    + Add
                  </button>
                </div>
                <div className="tags-list">
                  {availableTags.slice(0, 10).map((tag) => (
                    <button
                      key={tag}
                      className={`tag ${selectedTags.includes(tag) ? 'selected' : ''}`}
                      onClick={() => toggleTagSelection(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                  {availableTags.length > 10 && (
                    <button className="tag more">
                      +{availableTags.length - 10} more
                    </button>
                  )}
                </div>
              </div>

              <div className="sidebar-section">
                <h2 className="sidebar-section-title">Storage</h2>
                <div className="storage-bar">
                  <div className="storage-fill"></div>
                </div>
                <p className="storage-text">8.5 GB of 15 GB used</p>
              </div>
            </nav>
          </aside>
        )}

        {/* Main Content Area */}
        <main className="main">
          {/* Page heading and actions */}
          <div className="page-header">
            <div>
              <h2 className="page-title">
                {activeFolder === 'All Files' ? 'All Documents' : activeFolder}
              </h2>
              <p className="page-subtitle">
                {filteredDocuments.length}{' '}
                {filteredDocuments.length === 1 ? 'document' : 'documents'}
              </p>
            </div>

            <div className="page-actions">
              {/* Bulk actions */}
              {showBulkActions && (
                <div className="bulk-actions">
                  <span className="bulk-selection">
                    {selectedDocuments.length} selected
                  </span>
                  <button
                    className="bulk-button favorite"
                    onClick={() => handleBulkAction('favorite')}
                    title="Add to favorites"
                  >
                    <Star size={16} />
                  </button>
                  <button
                    className="bulk-button unfavorite"
                    onClick={() => handleBulkAction('unfavorite')}
                    title="Remove from favorites"
                  >
                    <StarOff size={16} />
                  </button>
                  <button
                    className="bulk-button delete"
                    onClick={() => handleBulkAction('delete')}
                    title="Delete selected"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    className="bulk-button cancel"
                    onClick={() => {
                      setSelectedDocuments([]);
                      setShowBulkActions(false);
                    }}
                    title="Cancel selection"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Sort options */}
              <div className="sort-container">
                <button
                  className="sort-button"
                  onClick={() => {
                    const dropdown = document.querySelector('.sort-dropdown');
                    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                  }}
                >
                  <Filter size={16} className="icon" />
                  <span>Sort</span>
                  <ChevronDown size={14} className="icon" />
                </button>
                <div className="sort-dropdown" style={{ display: 'none' }}>
                  <button
                    className="sort-option"
                    onClick={() => {
                      setSortBy('nameAsc');
                      document.querySelector('.sort-dropdown').style.display = 'none';
                    }}
                  >
                    Name (A-Z)
                  </button>
                  <button
                    className="sort-option"
                    onClick={() => {
                      setSortBy('nameDesc');
                      document.querySelector('.sort-dropdown').style.display = 'none';
                    }}
                  >
                    Name (Z-A)
                  </button>
                  <button
                    className="sort-option"
                    onClick={() => {
                      setSortBy('dateDesc');
                      document.querySelector('.sort-dropdown').style.display = 'none';
                    }}
                  >
                    Date (Newest)
                  </button>
                  <button
                    className="sort-option"
                    onClick={() => {
                      setSortBy('dateAsc');
                      document.querySelector('.sort-dropdown').style.display = 'none';
                    }}
                  >
                    Date (Oldest)
                  </button>
                  <button
                    className="sort-option"
                    onClick={() => {
                      setSortBy('sizeDesc');
                      document.querySelector('.sort-dropdown').style.display = 'none';
                    }}
                  >
                    Size (Largest)
                  </button>
                  <button
                    className="sort-option"
                    onClick={() => {
                      setSortBy('sizeAsc');
                      document.querySelector('.sort-dropdown').style.display = 'none';
                    }}
                  >
                    Size (Smallest)
                  </button>
                </div>
              </div>
              {/* View Mode Toggle */}
              <div className="view-toggle">
                <button
                  className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid size={18} />
                </button>
                <button
                  className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Tag Filters */}
          {selectedTags.length > 0 && (
            <div className="tag-filters">
              <span className="tag-filter-label">Filtered by tags:</span>
              {selectedTags.map((tag) => (
                <div key={tag} className="tag-filter">
                  {tag}
                  <button
                    className="tag-filter-remove"
                    onClick={() => toggleTagSelection(tag)}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <button
                className="clear-tags"
                onClick={() => setSelectedTags([])}
              >
                Clear all
              </button>
            </div>
          )}

          {/* File List */}
          {uploading && (
            <div className="upload-progress">
              <div className="upload-progress-content">
                <div className="upload-progress-icon">
                  <Loader size={24} className="loader-icon" />
                </div>
                <div className="upload-progress-details">
                  <div className="upload-progress-header">
                    <span className="upload-progress-title">Uploading files...</span>
                    <span className="upload-progress-percent">{uploadProgress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'list' ? (
            <div className="table-container">
              <table className="document-table">
                <thead className="table-header">
                  <tr>
                    <th className="table-checkbox">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={
                          selectedDocuments.length === sortedDocuments.length &&
                          sortedDocuments.length > 0
                        }
                        onChange={toggleAllDocuments}
                      />
                    </th>
                    <th className="table-column">Name</th>
                    <th className="table-column">Size</th>
                    <th className="table-column">Modified</th>
                    <th className="table-column">Owner</th>
                    <th className="table-column actions">Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {sortedDocuments.map((doc) => (
                    <tr key={doc._id} className="table-row">
                      <td className="table-checkbox">
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={selectedDocuments.includes(doc._id)}
                          onChange={() => toggleDocumentSelection(doc._id)}
                        />
                      </td>
                      <td className="table-cell">
                        <div className="file-info">
                          {getFileIcon(doc.type)}
                          <div className="file-details">
                            <div className="file-name-container">
                              <div
                                className="file-name"
                                onClick={() => viewFileDetails(doc)}
                              >
                                {doc.name}
                              </div>
                              {doc.favorite && (
                                <Star size={14} className="favorite-icon" />
                              )}
                            </div>
                            <div className="file-meta">
                              <span className="file-type">{doc.type.toUpperCase()}</span>
                              {doc.tags.length > 0 && (
                                <div className="file-tags">
                                  <Tag size={12} className="tag-icon" />
                                  <span>{doc.tags.slice(0, 2).join(', ')}</span>
                                  {doc.tags.length > 2 && (
                                    <span> +{doc.tags.length - 2}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">{doc.size}</td>
                      <td className="table-cell">
                        <div className="file-modified">{new Date(doc.lastModified).toLocaleDateString()}</div>
                        <div className="file-creator">by {doc.createdBy}</div>
                      </td>
                      <td className="table-cell">{getPermissionBadge(doc.permissions)}</td>
                      <td className="table-cell actions">
                        <div className="action-buttons">
                          <button
                            className="action-button favorite"
                            onClick={() => toggleFavorite(doc._id)}
                            title={doc.favorite ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            {doc.favorite ? (
                              <Star size={16} className="favorite-icon" />
                            ) : (
                              <Star size={16} />
                            )}
                          </button>
                          <button
                            className="action-button preview"
                            onClick={() => openFilePreview(doc)}
                            title="Preview"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="action-button download"
                            onClick={() => downloadDocument(doc._id, doc.name)}
                            title="Download"
                          >
                            <Download size={16} />
                          </button>
                          <button
                            className="action-button share"
                            onClick={() => {
                              navigator.clipboard.writeText(`Shared: ${doc.name}`);
                              showNotification('success', 'File link copied to clipboard');
                            }}
                            title="Share"
                          >
                            <Share size={16} />
                          </button>
                          <button
                            className="action-button link"
                            onClick={() => createFileLink(doc._id)}
                            title="Create Link"
                          >
                            <FileSymlink size={16} />
                          </button>
                          <div className="more-menu-container">
                            <button
                              className="action-button more"
                              onClick={() => setShowMoreMenu(showMoreMenu === doc._id ? null : doc._id)}
                              title="More actions"
                            >
                              <MoreHorizontal size={16} />
                            </button>
                            {showMoreMenu === doc._id && (
                              <div className="more-menu" style={{ position: 'absolute', zIndex: 1000 }}>
                                <button
                                  className="more-menu-item"
                                  onClick={() => handleMoreMenu(doc._id, 'rename')}
                                >
                                  Rename
                                </button>
                                <button
                                  className="more-menu-item"
                                  onClick={() => handleMoreMenu(doc._id, 'move')}
                                >
                                  Move
                                </button>
                                <button
                                  className="more-menu-item"
                                  onClick={() => handleMoreMenu(doc._id, 'versionHistory')}
                                >
                                  Version History
                                </button>
                              </div>
                            )}
                          </div>
                          <button
                            className="action-button delete"
                            onClick={() => deleteDocument(doc._id)}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Empty State */}
              {filteredDocuments.length === 0 && (
                <div className="empty-state">
                  <FileText size={64} className="empty-icon" />
                  <h3 className="empty-title">No documents found</h3>
                  <p className="empty-text">
                    {searchTerm || selectedTags.length > 0 || activeFolder !== 'All Files'
                      ? 'Try adjusting your filters or'
                      : 'Start by'}{' '}
                    uploading a document
                  </p>
                  <input
                    type="file"
                    id="file-upload-empty"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".doc,.docx,.pdf,.xlsx,.xls,.pptx,.ppt,.zip,.rar"
                    multiple
                  />
                  <label htmlFor="file-upload-empty" className="upload-button empty">
                    <Upload size={16} className="icon" />
                    Upload Files
                  </label>
                </div>
              )}
            </div>
          ) : (
            <div className="grid-container">
              {sortedDocuments.map((doc) => (
                <div key={doc._id} className="grid-item">
                  <div className="grid-item-header">
                    <div className="grid-checkbox">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={selectedDocuments.includes(doc._id)}
                        onChange={() => toggleDocumentSelection(doc._id)}
                      />
                    </div>
                    <div className="grid-favorite">
                      <button
                        className="favorite-button"
                        onClick={() => toggleFavorite(doc._id)}
                      >
                        {doc.favorite ? (
                          <Star size={16} className="favorite-icon" />
                        ) : (
                          <Star size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="grid-icon">{getFileIcon(doc.type)}</div>
                  <h3 className="grid-title" title={doc.name}>
                    {doc.name}
                  </h3>
                  <div className="grid-meta">
                    {doc.size} • {new Date(doc.lastModified).toLocaleDateString()}
                  </div>
                  {doc.tags.length > 0 && (
                    <div className="grid-tags">
                      {doc.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="tag">
                          {tag}
                        </span>
                      ))}
                      {doc.tags.length > 2 && (
                        <span className="tag">+{doc.tags.length - 2}</span>
                      )}
                    </div>
                  )}
                  <div className="grid-actions">
                    <button
                      className="action-button preview"
                      onClick={() => openFilePreview(doc)}
                      title="Preview"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="action-button download"
                      onClick={() => downloadDocument(doc._id, doc.name)}
                      title="Download"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      className="action-button details"
                      onClick={() => viewFileDetails(doc)}
                      title="Details"
                    >
                      <Info size={16} />
                    </button>
                    <button
                      className="action-button link"
                      onClick={() => createFileLink(doc._id)}
                      title="Create Link"
                    >
                      <FileSymlink size={16} />
                    </button>
                    <div className="more-menu-container">
                      <button
                        className="action-button more"
                        onClick={() =>
                          setShowMoreMenu(showMoreMenu === doc._id ? null : doc._id)
                        }
                        title="More actions"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {showMoreMenu === doc._id && (
                        <div className="more-menu">
                          <button
                            className="more-menu-item"
                            onClick={() => handleMoreMenu(doc._id, 'rename')}
                          >
                            Rename
                          </button>
                          <button
                            className="more-menu-item"
                            onClick={() => handleMoreMenu(doc._id, 'move')}
                          >
                            Move
                          </button>
                          <button
                            className="more-menu-item"
                            onClick={() => handleMoreMenu(doc._id, 'versionHistory')}
                          >
                            Version History
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      className="action-button delete"
                      onClick={() => deleteDocument(doc._id)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {filteredDocuments.length === 0 && (
                <div className="empty-state grid">
                  <FileText size={64} className="empty-icon" />
                  <h3 className="empty-title">No documents found</h3>
                  <p className="empty-text">
                    {searchTerm || selectedTags.length > 0 || activeFolder !== 'All Files'
                      ? 'Try adjusting your filters or'
                      : 'Start by'}{' '}
                    uploading a document
                  </p>
                  <input
                    type="file"
                    id="file-upload-empty-grid"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".doc,.docx,.pdf,.xlsx,.xls,.pptx,.ppt,.zip,.rar"
                    multiple
                  />
                  <label
                    htmlFor="file-upload-empty-grid"
                    className="upload-button empty"
                  >
                    <Upload size={16} className="icon" />
                    Upload Files
                  </label>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Activity Feed Sidebar */}
        {showActivityFeed && (
          <aside className="activity-sidebar">
            <div className="activity-content">
              <div className="activity-header">
                <h2 className="activity-title">Recent Activity</h2>
                <button
                  className="close-button"
                  onClick={() => setShowActivityFeed(false)}
                >
                  <X size={18} />
                </button>
              </div>
              <div className="activity-list">
                {activities.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon">
                      {activity.action === 'uploaded' && <Upload size={16} />}
                      {activity.action === 'modified' && <Edit size={16} />}
                      {activity.action === 'shared' && <Share size={16} />}
                      {activity.action === 'commented on' && <MessageCircle size={16} />}
                      {activity.action === 'downloaded' && <Download size={16} />}
                      {activity.action === 'deleted' && <Trash2 size={16} />}
                    </div>
                    <div>
                      <p className="activity-text">
                        <span className="activity-user">{activity.user}</span>{' '}
                        {activity.action}{' '}
                        <span className="activity-document">{activity.document}</span>
                      </p>
                      <p className="activity-time">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* File Details Sidebar */}
      {showFileDetails && selectedFile && (
        <div className="file-details-overlay" style={{ paddingTop: '80px' }}>
          <div className="file-details-sidebar">
            <div className="file-details-header">
              <div className="file-details-title-container">
                <h2 className="file-details-title">File Details</h2>
                <button
                  className="close-button"
                  onClick={() => setShowFileDetails(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="file-details-icon">{getFileIcon(selectedFile.type)}</div>
              <h3 className="file-details-name">{selectedFile.name}</h3>
              <div className="file-details-meta">
                {selectedFile.type.toUpperCase()} • {selectedFile.size}
              </div>
            </div>

            <div className="file-details-section">
              <h4 className="section-title">Properties</h4>
              <div className="properties-list">
                <div className="property-item">
                  <span className="property-label">
                    <Calendar size={16} className="icon" />
                    Created
                  </span>
                  <span className="property-value">{new Date(selectedFile.uploadDate).toLocaleDateString()}</span>
                </div>
                <div className="property-item">
                  <span className="property-label">
                    <Calendar size={16} className="icon" />
                    Modified
                  </span>
                  <span className="property-value">{new Date(selectedFile.lastModified).toLocaleDateString()}</span>
                </div>
                <div className="property-item">
                  <span className="property-label">Created by</span>
                  <span className="property-value">{selectedFile.createdBy}</span>
                </div>
                <div className="property-item">
                  <span className="property-label">Version</span>
                  <span className="property-value">{selectedFile.version}</span>
                </div>
                <div className="property-item">
                  <span className="property-label">Folder</span>
                  <span className="property-value">{selectedFile.folder}</span>
                </div>
              </div>
            </div>

            <div className="file-details-section">
              <div className="tags-header">
                <h4 className="section-title">Tags</h4>
                <button
                  className="add-tag-button"
                  onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                >
                  + Add Tag
                </button>
              </div>

              <div className="tags-list">
                {selectedFile.tags.map((tag) => (
                  <div key={tag} className="tag removable">
                    {tag}
                    <button
                      className="tag-remove"
                      onClick={() => removeTagFromDocument(selectedFile._id, tag)}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>

              {isTagDropdownOpen && (
                <div className="tag-dropdown">
                  <div className="tag-input-container">
                    <input
                      type="text"
                      placeholder="Add or create tag..."
                      className="tag-input"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                    />
                  </div>
                  <div className="tag-options">
                    {availableTags
                      .filter((tag) => !selectedFile.tags.includes(tag))
                      .filter((tag) => tag.toLowerCase().includes(tagInput.toLowerCase()))
                      .map((tag) => (
                        <div
                          key={tag}
                          className="tag-option"
                          onClick={() => {
                            addTagToDocument(selectedFile._id, tag);
                            setTagInput('');
                          }}
                        >
                          {tag}
                        </div>
                      ))}
                  </div>
                  {tagInput && !availableTags.includes(tagInput) && (
                    <div
                      className="create-tag"
                      onClick={() => {
                        addTagToDocument(selectedFile._id, tagInput);
                        setAvailableTags([...availableTags, tagInput]);
                        setTagInput('');
                        setIsTagDropdownOpen(false);
                        showNotification('success', `Tag "${tagInput}" added`);
                      }}
                    >
                      Create "{tagInput}"
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="file-details-section">
              <h4 className="section-title">Sharing & Permissions</h4>
              <div className="sharing-info">
                <div className="sharing-details">
                  <div className="sharing-icon">
                    <Lock size={16} />
                  </div>
                  <span className="sharing-text">Only you have access</span>
                </div>
                <button className="change-sharing">Change</button>
              </div>

              <div className="sharing-actions">
                <button
                  className="action-button share full"
                  onClick={() => {
                    navigator.clipboard.writeText(`Shared: ${selectedFile.name}`);
                    showNotification('success', 'File link copied to clipboard');
                  }}
                >
                  <Share size={16} className="icon" />
                  Share
                </button>
                <button
                  className="action-button download full"
                  onClick={() => downloadDocument(selectedFile._id, selectedFile.name)}
                >
                  <Download size={16} className="icon" />
                  Download
                </button>
                <button
                  className="action-button delete full"
                  onClick={() => {
                    deleteDocument(selectedFile._id);
                    setShowFileDetails(false);
                  }}
                >
                  <Trash2 size={16} className="icon" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-body">
              <h3 className="modal-title">Create New Folder</h3>
              <input
                type="text"
                placeholder="Folder name"
                className="modal-input"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
              <div className="modal-actions">
                <button
                  className="modal-button cancel"
                  onClick={() => setShowNewFolderModal(false)}
                >
                  Cancel
                </button>
                <button className="modal-button create" onClick={createNewFolder}>
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Tag Modal */}
      {showNewTagModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-body">
              <h3 className="modal-title">Create New Tag</h3>
              <input
                type="text"
                placeholder="Tag name"
                className="modal-input"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
              />
              <div className="modal-actions">
                <button
                  className="modal-button cancel"
                  onClick={() => setShowNewTagModal(false)}
                >
                  Cancel
                </button>
                <button className="modal-button create" onClick={createNewTag}>
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {showPreviewModal && previewFile && (
        <div
          className="modal-overlay preview"
          role="dialog"
          aria-labelledby="preview-title"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowPreviewModal(false);
              setPreviewFile(null);
            }
          }}
          tabIndex={-1}
          style={{ paddingTop: '180px' }} // Offset to appear below navbar
        >
          <div className="preview-modal">
            <div className="preview-header">
              <h3 id="preview-title" className="preview-title">
                {previewFile.name}
              </h3>
              <div className="preview-actions">
                <button
                  className="preview-button download"
                  onClick={() => downloadDocument(previewFile._id, previewFile.name)}
                  title="Download"
                >
                  <Download size={18} />
                </button>
                <button
                  className="preview-button share"
                  onClick={() => {
                    navigator.clipboard.writeText(`Shared: ${previewFile.name}`);
                    showNotification('success', 'File link copied to clipboard');
                  }}
                  title="Share"
                >
                  <Share size={18} />
                </button>
                <button
                  className="preview-button close"
                  onClick={() => {
                    setShowPreviewModal(false);
                    setPreviewFile(null);
                  }}
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="preview-content">
              {['pdf', 'txt', 'doc', 'docx'].includes(previewFile.type.toLowerCase()) ? (
                <div className="preview-body">
                  <h4 className="preview-subtitle">Preview</h4>
                  <p className="preview-text">
                    This is a simulated preview of {previewFile.name}. In a real
                    application, you would render the actual content here (e.g., PDF
                    viewer, text content).
                  </p>
                </div>
              ) : (
                <div className="preview-unavailable">
                  <div className="preview-icon">{getFileIcon(previewFile.type)}</div>
                  <p className="preview-text">
                    Preview not available for {previewFile.type.toUpperCase()} files
                  </p>
                  <button
                    className="download-button"
                    onClick={() => downloadDocument(previewFile._id, previewFile.name)}
                  >
                    Download to view
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className="notification-container">
          <div className={`notification ${notification.type}`}>
            {notification.type === 'success' && <CheckCircle size={20} />}
            {notification.type === 'error' && <AlertCircle size={20} />}
            {notification.type === 'warning' && <AlertTriangle size={20} />}
            {notification.type === 'info' && <Info size={20} />}
            <p>{notification.message}</p>
          </div>
        </div>
      )}

      {/* Activity Toggle Button */}
      <button
        className={`activity-toggle ${showActivityFeed ? 'active' : ''}`}
        onClick={() => setShowActivityFeed(!showActivityFeed)}
        title={showActivityFeed ? 'Hide activity' : 'Show activity'}
      >
        <Clock size={20} />
      </button>
    </div>
  );
};

export default Start;