export default function Loading({ text = 'Loading...' }) {
  return (
    <div style={{padding:20, textAlign:'center'}}>
      <div style={{width:36,height:36,border:'4px solid #eee',borderTop:'4px solid #0078ff',borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto'}}/>
      <div style={{marginTop:8}}>{text}</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
