import React from 'react';
import SensorTable from './components/SensorTable';
import './App.css';
import { Typography } from '@mui/material';
import { Badge } from '@mui/icons-material';

function App() {

	return (
		<>
		<Typography variant="h6" gutterBottom sx={{ marginBottom: 5 }}>
                            Gestión de Sensores
                           
                        </Typography>
			<SensorTable />
		</>
	);
}

export default App
