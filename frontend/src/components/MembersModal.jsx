import { X } from "lucide-react";

function MembersModal({ members, onClose }) {
  return (
    <div className="create-channel-modal-overlay">
      <div className="create-channel-modal">
        {/* HEADER */}
        <div className="create-channel-modal__header">
          <h2>Channel Members</h2>
          <button onClick={onClose} className="create-channel-modal__close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MEMBERS LIST */}
        <div className="create-channel-modal__form">
          <div className="members-list" style={{ maxHeight: '350px', padding: '0.5rem' }}>
            {members.map((member) => (
              <div key={member.user.id} className="member-item">
                {member.user?.image ? (
                  <img
                    src={member.user.image}
                    alt={member.user.name}
                    className="member-avatar"
                  />
                ) : (
                  <div className="member-avatar member-avatar-placeholder">
                    <span>
                      {(member.user.name || member.user.id).charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                <span className="member-name">
                  {member.user.name || member.user.id}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MembersModal;
