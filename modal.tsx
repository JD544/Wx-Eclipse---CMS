interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
  }

const Modal = ({
     isOpen, onClose, title, children
     }: ModalProps) => {
    if (!isOpen) return null;
  
    return (
      <div className="wx-auth-modal-overlay">
        <div className="wx-auth-modal">
          <div className="wx-auth-modal-header">
            <h3 className="wx-auth-modal-title">{title}</h3>
            <button className="wx-auth-modal-close" onClick={onClose}>×</button>
          </div>
          <div className="wx-auth-modal-content">
            {children}
          </div>
        </div>
      </div>
    );
  };
  
  // Example usage for adding user:
//   const AddUserForm = ({ onSubmit, onClose }) => (
//     <form onSubmit={onSubmit} className="wx-auth-modal-form">
//       <div className="wx-auth-field">
//         <label className="wx-auth-label">Name</label>
//         <input type="text" className="wx-auth-input" required />
//       </div>
//       <div className="wx-auth-field">
//         <label className="wx-auth-label">Email</label>
//         <input type="email" className="wx-auth-input" required />
//       </div>
    //   <div className="wx-auth-field">
    //     <label className="wx-auth-label">Password</label>
    //     <input type="password" className="wx-auth-input" required />
    //   </div>
//       <div className="wx-auth-modal-actions">
//         <button type="button" className="wx-auth-button wx-auth-button-secondary" onClick={onClose}>
//           Cancel
//         </button>
//         <button type="submit" className="wx-auth-button">
//           Add User
//         </button>
//       </div>
//     </form>
//   );
  
  export { Modal };