import { useStaff } from '../../context/StaffContext';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Dropdown } from '../ui/Dropdown';

export function StaffHeader() {
  const { staff, logout } = useStaff();

  const userMenuItems = [
    { label: 'Profile', icon: '👤', onClick: () => {} },
    { label: 'Settings', icon: '⚙️', onClick: () => {} },
    { label: 'Sign out', icon: '🚪', onClick: logout, danger: true },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-staff-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-staff-500">
            {staff?.restaurant?.name || 'Seamless'} — Staff
          </p>
          <h1 className="font-display text-xl font-semibold text-staff-900 truncate">
            Operations Dashboard
          </h1>
        </div>

        <Dropdown
          trigger={
            <div className="flex items-center gap-3 cursor-pointer">
              <Avatar
                name={staff?.username}
                size="sm"
                status="online"
                src={staff?.avatar_url}
              />
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-staff-900">{staff?.username}</p>
                <p className="text-xs text-staff-500 capitalize">{staff?.role}</p>
              </div>
              <svg className="w-4 h-4 text-staff-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          }
          items={userMenuItems}
          align="right"
        />
      </div>
    </header>
  );
}