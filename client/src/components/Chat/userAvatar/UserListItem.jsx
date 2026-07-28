import UserAvatar from "../userAvatar/UserAvatar";

const UserListItem = ({ handleFunction, user }) => {
  return (
    <button
      onClick={handleFunction}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
        padding: '8px 10px', borderRadius: '10px', marginBottom: '4px',
        backgroundColor: '#1e1e2e', border: '1px solid #2e2e42',
        cursor: 'pointer', textAlign: 'left',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2a2a3e'}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1e1e2e'}
    >
      <UserAvatar name={user.name} pic={user.pic} size={36} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: '#e5e7eb', fontSize: '14px', fontWeight: 500, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
        <p style={{ color: '#6b7280', fontSize: '12px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
      </div>
    </button>
  );
};

export default UserListItem;
