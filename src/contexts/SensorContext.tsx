import React, { createContext, useContext, useState, useEffect } from "react";
import {
	collection,
	addDoc,
	updateDoc,
	deleteDoc,
	doc,
	onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";

interface Sensor {
	id: string;
	name: string;
	type: string;
	value: number;
	status: boolean;
}

interface SensorContextValue {
	sensors: Sensor[];
	addSensor: (sensor: Omit<Sensor, "id">) => Promise<void>;
	updateSensor: (id: string, sensor: Partial<Sensor>) => Promise<void>;
	deleteSensor: (id: string) => Promise<void>;
}

const SensorContext = createContext<SensorContextValue | undefined>(undefined);

export const SensorProvider: React.FC = ({ children }) => {
	const [sensors, setSensors] = useState<Sensor[]>([]);

	useEffect(() => {
		const unsubscribe = onSnapshot(collection(db, "sensors"), (snapshot) => {
			const sensorsData = snapshot.docs.map((doc) => ({
				id: doc.id,
				...(doc.data() as Omit<Sensor, "id">),
			}));
			setSensors(sensorsData);
		});
		return () => unsubscribe();
	}, []);

	//Agregar Sensor
	const addSensor = async (sensor: Omit<Sensor, "id">) => {
		await addDoc(collection(db, "sensors"), sensor);
	};

	//Editar Sensor
	const updateSensor = async (id: string, sensor: Partial<Sensor>) => {
		const sensorRef = doc(db, "sensors", id);
		await updateDoc(sensorRef, sensor);
	};

	//Eliminar Sensor
	const deleteSensor = async (id: string) => {
		const sensorRef = doc(db, "sensors", id);
		await deleteDoc(sensorRef);
	};

	return (
		<SensorContext.Provider
			value={{ sensors, addSensor, updateSensor, deleteSensor }}
		>
			{children}
		</SensorContext.Provider>
	);
};
//Hook
export const useSensors = () => {
	const context = useContext(SensorContext);
	if (!context)
		throw new Error("useSensors debe usarse dentro de SensorProvider");
	return context;
};
