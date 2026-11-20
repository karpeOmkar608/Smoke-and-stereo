import { Account } from '@/components/account';
export const metadata = { title: 'Your account', robots: { index: false, follow: false } };
export default function AccountPage() {
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow muted">YOUR OWN FREQUENCY</span>
        <h1>YOUR ACCOUNT.</h1>
      </div>
      <div className="page-content">
        <Account />
      </div>
    </>
  );
}
