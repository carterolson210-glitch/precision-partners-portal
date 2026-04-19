import { useState } from 'react';

export const BeamLoadCalculator = () => {
  const [span, setSpan] = useState(6);
  const [load, setLoad] = useState(15);

  const moment = (load * Math.pow(span, 2)) / 8;

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2 style={{ marginBottom: '15px' }}>Beam Load Calculator</h2>
      <div style={{ marginBottom: '10px' }}>
        <label>Span (m): </label>
        <input 
          type="number" 
          value={span} 
          onChange={(e) => setSpan(Number(e.target.value))} 
        />
      </div>
      <div>
        <label>Load (kN/m): </label>
        <input 
          type="number" 
          value={load} 
          onChange={(e) => setLoad(Number(e.target.value))} 
        />
      </div>
      <div style={{ marginTop: '20px', fontWeight: 'bold' }}>
        Max Moment: {moment.toFixed(2)} kNm
      </div>
    </div>
  );
};