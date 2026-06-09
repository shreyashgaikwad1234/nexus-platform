import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const ExecutiveLite = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_URL = import.meta.env.PUBLIC_API_URL || 'https://nexus-platform-t1v1.onrender.com';
    fetch(`${API_URL}/metrics`)
      .then(res => res.json())
      .then(data => {
        setMetrics(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{color: 'white'}}>LITE LOADING...</div>;
  if (!metrics) return <div style={{color: 'red'}}>LITE ERROR</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: 'white', padding: '20px' }}>
      <h1>NEXUS LITE DASHBOARD <Activity size={24} color="#10b981" /></h1>
      <div style={{ height: '200px', width: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={[{ name: 'Test', val: 10 }]}>
            <Bar dataKey="val" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <pre>{JSON.stringify(metrics, null, 2)}</pre>
    </motion.div>
  );
};

export default ExecutiveLite;
