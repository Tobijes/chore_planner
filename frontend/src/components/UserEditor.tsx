interface Props {
  users: [string, string];
  setUser: (index: 0 | 1, name: string) => void;
}

export function UserEditor({ users, setUser }: Props) {
  return (
    <div className="user-editor">
      <h2>Users</h2>
      <div className="user-inputs">
        <label>
          User 1:
          <input
            type="text"
            value={users[0]}
            onChange={(e) => setUser(0, e.target.value)}
          />
        </label>
        <label>
          User 2:
          <input
            type="text"
            value={users[1]}
            onChange={(e) => setUser(1, e.target.value)}
          />
        </label>
      </div>
    </div>
  );
}
