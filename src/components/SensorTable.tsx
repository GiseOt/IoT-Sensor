import React, { useEffect, useState } from "react";
import SensorFilters from "./SensorFilters";
import SensorForm from "./SensorForm";
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	IconButton,
	Badge,
	Typography,
	CircularProgress,
	Tooltip,
	Button,
} from "@mui/material";
import { useSensors } from "../contexts/SensorContext";
import { Edit, Delete, ArrowUpward, ArrowDownward } from "@mui/icons-material";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

type Sensor = {
	id: string;
	name: string;
	type: string;
	value: number;
	status: boolean;
	update: Date | null;
};

type SortConfig = {
	key: keyof Sensor;
	direction: "asc" | "desc";
};

const SensorTable: React.FC = () => {
	const [sensors, setSensors] = useState<Sensor[]>([]);
	const [loading, setLoading] = useState(true);
	const [sortConfig, setSortConfig] = useState<SortConfig>({
		key: "id",
		direction: "desc",
	});
	const { addSensor, updateSensor, deleteSensor } = useSensors();

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingSensor, setEditingSensor] = useState<Sensor | null>(null);
	const [filters, setFilters] = useState({
		search: "",
		type: "",
		status: "",
	});

	// Abrir formulario para crear un sensor nuevo
	const handleCreate = () => {
		setEditingSensor(null);
		setIsFormOpen(true);
	};

	// Abrir formulario para editar
	const handleEdit = (sensor: Sensor) => {
		setEditingSensor(sensor);
		setIsFormOpen(true);
	};

	// Eliminar Sensor
	const handleDelete = (id: string) => {
		if (window.confirm("¿Seguro que quieres eliminar este sensor?")) {
			deleteSensor(id);
		}
	};

	// Formatear fecha y hora
	const formatTime = (date: Date | null) =>
		date
			? date.toLocaleTimeString("es-ES", {
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit",
			  })
			: "N/A";

	// Colores sensor/tipo
	const getValueColor = (tipo: string, valor: number) => {
		switch (tipo) {
			case "temperatura":
				if (valor > 30) return "red";
				if (valor < 15) return "blue";
				return "green";
			case "humedad":
				if (valor > 70) return "blue";
				if (valor < 30) return "orange";
				return "green";
			default:
				return "gray";
		}
	};

	// Unidad tipo de sensor
	const getValueUnit = (tipo: string) => {
		switch (tipo) {
			case "temperatura":
				return "°C";
			case "humedad":
				return "%";
			case "presion":
				return "hPa";
			case "luz":
				return "lux";
			case "movimiento":
				return "";
			default:
				return "";
		}
	};

	// Sensores en tiempo real
	useEffect(() => {
		const q = query(collection(db, "sensors"));

		const unsubscribe = onSnapshot(q, (querySnapshot) => {
			const data: Sensor[] = [];
			querySnapshot.forEach((doc) => {
				const d = doc.data();
				data.push({
					id: doc.id,
					name: d.name || "",
					type: d.type || "",
					value: d.value || 0,
					status: d.status ?? false,
					update: d.update ? d.update.toDate() : null,
				});
			});
			setSensors(data);
			setLoading(false);
		});

		return () => unsubscribe();
	}, []);

	// Ordenar sensores según la configuración actual
	const getSortedFilteredSensors = () => {
		return [...filteredSensors].sort((a, b) => {
			const key = sortConfig.key;
			const aVal = a[key];
			const bVal = b[key];

			if (aVal instanceof Date && bVal instanceof Date) {
				return sortConfig.direction === "asc"
					? aVal.getTime() - bVal.getTime()
					: bVal.getTime() - aVal.getTime();
			}

			if (typeof aVal === "string" && typeof bVal === "string") {
				return sortConfig.direction === "asc"
					? aVal.localeCompare(bVal)
					: bVal.localeCompare(aVal);
			}

			if (typeof aVal === "number" && typeof bVal === "number") {
				return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
			}

			if (typeof aVal === "boolean" && typeof bVal === "boolean") {
				return sortConfig.direction === "asc"
					? Number(aVal) - Number(bVal)
					: Number(bVal) - Number(aVal);
			}

			return 0;
		});
	};

	// Cambiar orden de la columna
	const handleSort = (key: keyof Sensor) => {
		setSortConfig((prev) => ({
			key,
			direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
		}));
	};

	// Icono (flecha arriba/abajo)
	const getSortIcon = (key: keyof Sensor) => {
		if (sortConfig.key !== key) return null;
		return sortConfig.direction === "asc" ? (
			<ArrowUpward fontSize="small" />
		) : (
			<ArrowDownward fontSize="small" />
		);
	};

	//Aplicar filtros
	const filteredSensors = sensors.filter((sensor) => {
		const matchesSearch =
			filters.search === "" ||
			sensor.name.toLowerCase().includes(filters.search.toLowerCase()) ||
			sensor.id.toLowerCase().includes(filters.search.toLowerCase()) ||
			sensor.type.toLowerCase().includes(filters.search.toLowerCase());

		const matchesType = filters.type === "" || sensor.type === filters.type;

		const matchesStatus =
			filters.status === "" || String(sensor.status) === filters.status;

		return matchesSearch && matchesType && matchesStatus;
	});

	const handleFilterChange = (newFilters: typeof filters) => {
		setFilters(newFilters);
	};

	return (
		<>
			<Paper
				elevation={3}
				sx={{
					width: 950,
					margin: "0 auto",
					paddingLeft: 15,
					paddingRight: 15,
					paddingTop: 4,
					paddingBottom: 24,
				}}
			>
				{/*  Filtros */}
				<SensorFilters sensors={sensors} onFilterChange={handleFilterChange} />

				<Typography variant="h6" gutterBottom sx={{ marginBottom: 5 }}>
					Sensores en Tiempo Real &nbsp;
					<Badge badgeContent={sensors.length} color="secondary" />
				</Typography>
				<Button variant="contained" onClick={handleCreate} sx={{ mb: 2 }}>
					+ Nuevo Sensor
				</Button>

				{loading ? (
					<CircularProgress />
				) : (
					<TableContainer>
						<Table>
							<TableHead>
								<TableRow>
									{["id", "name", "type", "value", "status", "update"].map(
										(key) => (
											<TableCell
												key={key}
												onClick={() => handleSort(key as keyof Sensor)}
												sx={{ cursor: "pointer", userSelect: "none" }}
											>
												<Typography
													variant="body2"
													fontWeight="bold"
													display="inline-flex"
													alignItems="center"
												>
													{key.charAt(0).toUpperCase() + key.slice(1)}{" "}
													{getSortIcon(key as keyof Sensor)}
												</Typography>
											</TableCell>
										)
									)}
									<TableCell>Acciones</TableCell>
								</TableRow>
							</TableHead>

							<TableBody>
								{getSortedFilteredSensors().length === 0 ? (
									<TableRow>
										<TableCell colSpan={7} align="center">
											No hay sensores disponibles...
										</TableCell>
									</TableRow>
								) : (
									getSortedFilteredSensors().map((sensor) => (
										<TableRow key={sensor.id} hover>
											<TableCell>
												{sensor.id.length > 20
													? sensor.id.substring(0, 20) + "..."
													: sensor.id}
											</TableCell>
											<TableCell>{sensor.name}</TableCell>
											<TableCell sx={{ textTransform: "capitalize" }}>
												{sensor.type}
											</TableCell>
											<TableCell
												sx={{
													fontWeight: "bold",
													color: getValueColor(sensor.type, sensor.value),
												}}
											>
												{sensor.value.toFixed(2)}
												{getValueUnit(sensor.type)}
											</TableCell>
											<TableCell>
												<Badge
													badgeContent={sensor.status ? "activo" : "inactivo"}
													color={sensor.status ? "success" : "error"}
													sx={{ paddingX: 2, borderRadius: 1 }}
												/>
											</TableCell>
											<TableCell>{formatTime(sensor.update)}</TableCell>
											<TableCell>
												<Tooltip title="Editar">
													<IconButton
														size="small"
														color="primary"
														onClick={() => handleEdit(sensor)}
													>
														<Edit />
													</IconButton>
												</Tooltip>
												<Tooltip title="Eliminar">
													<IconButton
														size="small"
														color="error"
														onClick={() => handleDelete(sensor.id)}
													>
														<Delete />
													</IconButton>
												</Tooltip>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</TableContainer>
				)}
			</Paper>
			<SensorForm
				isOpen={isFormOpen}
				onClose={() => setIsFormOpen(false)}
				sensor={editingSensor}
			/>
		</>
	);
};

export default SensorTable;
