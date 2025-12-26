export default function ErrorCard({ title='Error', message }) {
  return (
    <div style={{border:'1px solid #f1c0c0', background:'#fff6f6', padding:12, borderRadius:8}}>
      <strong>{title}</strong>
      <div style={{marginTop:6}}>{message}</div>
    </div>
  );
}
