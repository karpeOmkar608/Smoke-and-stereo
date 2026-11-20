import { Account } from '@/components/account';
export default function Reset() {
  return (
    <>
      <div className="page-heading">
        <h1>RESET PASSWORD.</h1>
      </div>
      <div className="page-content">
        <Account reset />
      </div>
    </>
  );
}
