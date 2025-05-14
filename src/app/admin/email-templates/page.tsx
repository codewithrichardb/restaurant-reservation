'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchEmailTemplates, updateEmailTemplate } from '@/api/admin';

type EmailTemplateType = 'confirmation' | 'reminder' | 'cancellation' | 'welcome';

interface EmailTemplate {
  _id: string;
  type: EmailTemplateType;
  subject: string;
  body: string;
  isActive: boolean;
  lastUpdated?: string;
}

export default function EmailTemplatesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  
  // Check if user is admin with more robust check
  const isAdmin = session?.user?.role === 'admin' || 
                 (session?.user?.role && String(session?.user?.role).toLowerCase() === 'admin');
  
  // Redirect if not admin
  if (status === 'authenticated' && !isAdmin) {
    router.push('/');
  }
  
  // Fetch email templates
  const { data: templates = [], isLoading, error } = useQuery({
    queryKey: ['emailTemplates'],
    queryFn: fetchEmailTemplates,
    enabled: status === 'authenticated' && isAdmin,
  });
  
  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: (data: { id: string; template: Partial<EmailTemplate> }) => 
      updateEmailTemplate(data.id, data.template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
      setEditingTemplate(null);
    },
  });
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingTemplate) return;
    
    updateTemplateMutation.mutate({
      id: editingTemplate._id,
      template: {
        subject: editingTemplate.subject,
        body: editingTemplate.body,
        isActive: editingTemplate.isActive,
      },
    });
  };
  
  // Get template name
  const getTemplateName = (type: EmailTemplateType) => {
    switch (type) {
      case 'confirmation':
        return 'Reservation Confirmation';
      case 'reminder':
        return 'Reservation Reminder';
      case 'cancellation':
        return 'Reservation Cancellation';
      case 'welcome':
        return 'Welcome Email';
      default:
        return 'Unknown Template';
    }
  };
  
  // Get template description
  const getTemplateDescription = (type: EmailTemplateType) => {
    switch (type) {
      case 'confirmation':
        return 'Sent to customers when their reservation is confirmed';
      case 'reminder':
        return 'Sent to customers 24 hours before their reservation';
      case 'cancellation':
        return 'Sent to customers when their reservation is cancelled';
      case 'welcome':
        return 'Sent to new users when they register';
      default:
        return '';
    }
  };
  
  // Get available variables for template
  const getTemplateVariables = (type: EmailTemplateType) => {
    const commonVariables = ['{{name}}', '{{restaurant_name}}'];
    
    switch (type) {
      case 'confirmation':
      case 'reminder':
      case 'cancellation':
        return [
          ...commonVariables,
          '{{date}}',
          '{{time}}',
          '{{party_size}}',
          '{{reservation_id}}',
          '{{special_requests}}',
        ];
      case 'welcome':
        return [
          ...commonVariables,
          '{{email}}',
        ];
      default:
        return commonVariables;
    }
  };
  
  // Preview template with sample data
  const previewTemplate = (template: EmailTemplate) => {
    let previewBody = template.body;
    
    // Replace variables with sample data
    previewBody = previewBody
      .replace(/{{name}}/g, 'John Doe')
      .replace(/{{restaurant_name}}/g, 'Gourmet Haven')
      .replace(/{{date}}/g, 'June 15, 2023')
      .replace(/{{time}}/g, '7:30 PM')
      .replace(/{{party_size}}/g, '4')
      .replace(/{{reservation_id}}/g, 'RES12345')
      .replace(/{{special_requests}}/g, 'Window table if possible')
      .replace(/{{email}}/g, 'john.doe@example.com');
    
    return previewBody;
  };
  
  if (status === 'loading' || isLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          Error loading email templates: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="font-serif">Email Templates</h1>
        <Link href="/admin" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-2"></i>
          Back to Dashboard
        </Link>
      </div>
      
      <div className="row">
        <div className="col-lg-4 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-light">
              <h5 className="mb-0">Available Templates</h5>
            </div>
            <div className="card-body">
              <div className="list-group">
                {templates.map((template) => (
                  <button
                    key={template._id}
                    className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                      editingTemplate?._id === template._id ? 'active' : ''
                    }`}
                    onClick={() => {
                      setEditingTemplate(template);
                      setPreviewMode(false);
                    }}
                  >
                    <div>
                      <h6 className="mb-1">{getTemplateName(template.type)}</h6>
                      <small>{getTemplateDescription(template.type)}</small>
                    </div>
                    <span className={`badge ${template.isActive ? 'bg-success' : 'bg-danger'}`}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-8">
          {editingTemplate ? (
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-light">
                <ul className="nav nav-tabs card-header-tabs">
                  <li className="nav-item">
                    <button
                      className={`nav-link ${!previewMode ? 'active' : ''}`}
                      onClick={() => setPreviewMode(false)}
                    >
                      <i className="bi bi-pencil me-2"></i>
                      Edit
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${previewMode ? 'active' : ''}`}
                      onClick={() => setPreviewMode(true)}
                    >
                      <i className="bi bi-eye me-2"></i>
                      Preview
                    </button>
                  </li>
                </ul>
              </div>
              <div className="card-body">
                {previewMode ? (
                  <div>
                    <h5 className="mb-3">Subject: {editingTemplate.subject}</h5>
                    <div className="border rounded p-3 bg-light">
                      <div dangerouslySetInnerHTML={{ __html: previewTemplate(editingTemplate).replace(/\n/g, '<br>') }} />
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="templateSubject" className="form-label">Subject</label>
                      <input
                        type="text"
                        className="form-control"
                        id="templateSubject"
                        value={editingTemplate.subject}
                        onChange={(e) => setEditingTemplate({
                          ...editingTemplate,
                          subject: e.target.value
                        })}
                        required
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="templateBody" className="form-label">Email Body</label>
                      <textarea
                        className="form-control"
                        id="templateBody"
                        rows={12}
                        value={editingTemplate.body}
                        onChange={(e) => setEditingTemplate({
                          ...editingTemplate,
                          body: e.target.value
                        })}
                        required
                      ></textarea>
                      <div className="form-text">
                        Use HTML for formatting. Line breaks will be preserved.
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="templateActive"
                          checked={editingTemplate.isActive}
                          onChange={(e) => setEditingTemplate({
                            ...editingTemplate,
                            isActive: e.target.checked
                          })}
                        />
                        <label className="form-check-label" htmlFor="templateActive">
                          Active
                        </label>
                      </div>
                    </div>
                    
                    <div className="d-flex justify-content-between">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setEditingTemplate(null)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={updateTemplateMutation.isPending}
                      >
                        {updateTemplateMutation.isPending ? 'Saving...' : 'Save Template'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
              <div className="card-footer bg-light">
                <h6 className="mb-2">Available Variables</h6>
                <div className="d-flex flex-wrap gap-2">
                  {getTemplateVariables(editingTemplate.type).map((variable) => (
                    <span
                      key={variable}
                      className="badge bg-secondary"
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        if (!previewMode) {
                          const textarea = document.getElementById('templateBody') as HTMLTextAreaElement;
                          if (textarea) {
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const text = textarea.value;
                            const newText = text.substring(0, start) + variable + text.substring(end);
                            setEditingTemplate({
                              ...editingTemplate,
                              body: newText
                            });
                            // Set cursor position after the inserted variable
                            setTimeout(() => {
                              textarea.focus();
                              textarea.setSelectionRange(start + variable.length, start + variable.length);
                            }, 0);
                          }
                        }
                      }}
                    >
                      {variable}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <i className="bi bi-envelope-paper fs-1 text-muted mb-3"></i>
                <h5>Select a template to edit</h5>
                <p className="text-muted">
                  Choose a template from the list on the left to edit its content.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
