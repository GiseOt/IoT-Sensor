import React, { useState, useEffect } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	FormHelperText,
	Switch,
	FormControlLabel,
	Button,
} from "@mui/material";

import { useSensors } from "../contexts/SensorContext";

interface SensorFormProps {
	isOpen: boolean;
	onClose: () => void;
	sensor?: Sensor | null;
}

const SENSOR_TYPES = ["temperatura", "humedad", "presion", "luz", "movimiento"];

const SensorForm: React.FC<SensorFormProps> = ({ isOpen, onClose, sensor }) => {
	const { addSensor, updateSensor } = useSensors();

	const [formData, setFormData] = useState({
		name: "",
		type: "",
		value: 0,
		status: true,
	});

	const [errors, setErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		if (sensor) {
			setFormData({
				name: sensor.name || "",
				type: sensor.type || "",
				value: sensor.value || 0,
				status: sensor.status !== undefined ? sensor.status : true,
			});
		} else {
			setFormData({
				name: "",
				type: "",
				value: 0,
				status: true,
			});
		}
		setErrors({});
	}, [sensor, isOpen]);

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.name.trim()) {
			newErrors.name = "El nombre es requerido";
		}

		if (!formData.type) {
			newErrors.type = "El tipo es requerido";
		}

		if (isNaN(formData.value)) {
			newErrors.value = "El valor debe ser un número";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		const payload = {
			name: formData.name,
			type: formData.type,
			value: formData.value,
			status: formData.status,
			update: new Date(),
		};

		if (sensor) {
			updateSensor(sensor.id, payload);
		} else {
			addSensor(payload);
		}

		onClose();
	};

	return (
		<Dialog open={isOpen} onClose={onClose} maxWidth="xs" fullWidth>
			<DialogTitle>
				{sensor ? "Editar Sensor" : "Crear Nuevo Sensor"}
			</DialogTitle>
			<DialogContent>
				<form id="sensor-form" onSubmit={handleSubmit} noValidate>
					<TextField
						margin="normal"
						fullWidth
						label="Nombre"
						value={formData.name}
						onChange={(e) =>
							setFormData((prev) => ({ ...prev, name: e.target.value }))
						}
						error={!!errors.name}
						helperText={errors.name}
					/>

					<FormControl fullWidth margin="normal" error={!!errors.type}>
						<InputLabel id="type-label">Tipo</InputLabel>
						<Select
							labelId="type-label"
							value={formData.type}
							label="Tipo"
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, type: e.target.value }))
							}
						>
							{SENSOR_TYPES.map((type) => (
								<MenuItem key={type} value={type}>
									{type.charAt(0).toUpperCase() + type.slice(1)}
								</MenuItem>
							))}
						</Select>
						{errors.type && <FormHelperText>{errors.type}</FormHelperText>}
					</FormControl>

					<TextField
						margin="normal"
						fullWidth
						label="Valor"
						type="number"
						inputProps={{ step: "0.01" }}
						value={formData.value}
						onChange={(e) =>
							setFormData((prev) => ({
								...prev,
								value: parseFloat(e.target.value) || 0,
							}))
						}
						error={!!errors.value}
						helperText={errors.value}
					/>

					<FormControlLabel
						control={
							<Switch
								checked={formData.status}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, status: e.target.checked }))
								}
							/>
						}
						label={`Sensor ${formData.status ? "Activo" : "Inactivo"}`}
						sx={{ mt: 2 }}
					/>
				</form>
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 2 }}>
				<Button variant="outlined" onClick={onClose}>
					Cancelar
				</Button>
				<Button type="submit" form="sensor-form" variant="contained">
					{sensor ? "Actualizar" : "Crear"}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default SensorForm;
