import React, { useState } from 'react';
import { Clock, FileText, Bed, Bell, Ambulance, MapPin, Check, X } from 'lucide-react';

// Type definitions
interface EmergencyCase {
    id: string;
    patientName: string;
    priority: "high" | "medium" | "low";
    eta: string;
    condition: string;
    paramedic: string;
    notes: string;
}

interface AcceptedCase extends EmergencyCase {
    status: PatientStatus;
    acceptedAt: string;
}

type PatientStatus =
    | "at the accident site"
    | "picked up by ambulance"
    | "on the way"
    | "arrived at hospital"
    | "in treatment";

type EmergencyTab = "all" | "incoming" | "treatment";
type AcceptedTab = PatientStatus | "all";

const EmergencyCasesComponent: React.FC = () => {
    // Initial emergency cases data
    const initialEmergencyCases: EmergencyCase[] = [
        {
            id: "EM-2023-04-12",
            patientName: "Pritam Das",
            priority: "high",
            eta: "8 min",
            condition: "Bike Accident",
            paramedic: "Soham Nandi",
            notes: "19-year-old male with broken legs. Needs immediate medical attention.",
        },
    ];

    // States for managing cases
    const [emergencyCases, setEmergencyCases] = useState<EmergencyCase[]>(initialEmergencyCases);
    const [acceptedCases, setAcceptedCases] = useState<AcceptedCase[]>([]);
    const [activeTab, setActiveTab] = useState<EmergencyTab>("all");
    const [acceptedTab, setAcceptedTab] = useState<AcceptedTab>("all");

    // Function to get priority color
    const getPriorityColor = (priority: EmergencyCase['priority']): string => {
        switch (priority) {
            case "high":
                return "bg-red-500";
            case "medium":
                return "bg-amber-500";
            case "low":
                return "bg-green-500";
            default:
                return "bg-blue-500";
        }
    };

    // Function to handle accepting a case
    const handleAcceptCase = (emergency: EmergencyCase): void => {
        // Remove from emergency cases

        setEmergencyCases(emergencyCases.filter(e => e.id !== emergency.id));

        // Add to accepted cases with initial status
        setAcceptedCases([
            ...acceptedCases,
            {
                ...emergency,
                status: "at the accident site",
                acceptedAt: new Date().toLocaleTimeString(),
            }
        ]);
    };

    // Function to handle declining a case
    const handleDeclineCase = (emergencyId: string): void => {
        setEmergencyCases(emergencyCases.filter(e => e.id !== emergencyId));
    };

    // Function to update patient status
    const updatePatientStatus = (patientId: string, newStatus: PatientStatus): void => {
        setAcceptedCases(acceptedCases.map(patient =>
            patient.id === patientId ? { ...patient, status: newStatus } : patient
        ));
    };

    // Filter emergency cases based on active tab
    const filteredEmergencyCases = emergencyCases.filter(emergency => {
        if (activeTab === "all") return true;
        if (activeTab === "incoming" && emergency.eta) return true;
        if (activeTab === "treatment" && !emergency.eta) return true;
        return false;
    });

    // Filter accepted cases based on active tab
    const filteredAcceptedCases = acceptedCases.filter(patient => {
        if (acceptedTab === "all") return true;
        return patient.status === acceptedTab;
    });

    // Possible patient statuses
    const patientStatuses: PatientStatus[] = [
        "at the accident site",
        "picked up by ambulance",
        "on the way",
        "arrived at hospital",
        "in treatment"
    ];

    return (
        <div className="space-y-8">
            {/* Live Emergency Cases Section */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                        <h3 className="text-xl font-semibold">Live Emergency Cases</h3>
                        <a
                            href="/emergencies"
                            className="text-xs bg-gradient-to-r from-cyan-500 to-purple-600 px-3 py-1 rounded-full text-white transition-colors flex items-center"
                        >
                            View All Emergencies
                        </a>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            className={`text-xs ${activeTab === "all" ? "bg-gray-700" : "bg-gray-800"} hover:bg-gray-600 px-3 py-1 rounded-full ${activeTab === "all" ? "text-gray-200" : "text-gray-400"} transition-colors`}
                            onClick={() => setActiveTab("all")}
                        >
                            All Cases
                        </button>
                        <button
                            className={`text-xs ${activeTab === "incoming" ? "bg-gray-700" : "bg-gray-800"} hover:bg-gray-600 px-3 py-1 rounded-full ${activeTab === "incoming" ? "text-gray-200" : "text-gray-400"} transition-colors`}
                            onClick={() => setActiveTab("incoming")}
                        >
                            Incoming
                        </button>
                        <button
                            className={`text-xs ${activeTab === "treatment" ? "bg-gray-700" : "bg-gray-800"} hover:bg-gray-600 px-3 py-1 rounded-full ${activeTab === "treatment" ? "text-gray-200" : "text-gray-400"} transition-colors`}
                            onClick={() => setActiveTab("treatment")}
                        >
                            In Treatment
                        </button>
                    </div>
                </div>

                {filteredEmergencyCases.length > 0 ? (
                    <div className="space-y-4">
                        {filteredEmergencyCases.map(emergency => (
                            <div
                                key={emergency.id}
                                className="bg-gray-800 rounded-xl border border-gray-700 p-4 shadow-lg hover:border-gray-600 transition-colors"
                            >
                                <div className="flex items-start">
                                    <div className={`w-3 h-3 ${getPriorityColor(emergency.priority)} rounded-full mt-2 mr-3`}></div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-medium">{emergency.patientName}</h4>
                                                <p className="text-sm text-gray-400">{emergency.id}</p>
                                            </div>
                                            <div className="bg-gray-700 rounded-lg px-3 py-1 text-sm flex items-center">
                                                <Clock size={14} className="mr-1 text-cyan-500" />
                                                <span>ETA: {emergency.eta}</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-3">
                                            <div>
                                                <p className="text-gray-400">Condition</p>
                                                <p>{emergency.condition}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400">Paramedic</p>
                                                <p>{emergency.paramedic}</p>
                                            </div>
                                        </div>
                                        <div className="text-sm bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                                            <p className="text-gray-300">{emergency.notes}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end mt-3 space-x-2">
                                    <button
                                        className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-full text-cyan-400 transition-colors flex items-center"
                                    >
                                        <FileText size={12} className="mr-1" />
                                        View Details
                                    </button>
                                    <button
                                        className="text-xs bg-green-600 hover:bg-green-700 px-3 py-1 rounded-full text-white transition-colors flex items-center"
                                        onClick={() => {
                                            fetch(`http://192.168.29.250:5000/api/emergency/x-hospital`, { method: 'POST' })
                                            handleAcceptCase(emergency);
                                        }
                                        }
                                    >
                                        <Check size={12} className="mr-1" />
                                        Accept
                                    </button>
                                    <button
                                        className="text-xs bg-red-600 hover:bg-red-700 px-3 py-1 rounded-full text-white transition-colors flex items-center"
                                        onClick={() => handleDeclineCase(emergency.id)}
                                    >
                                        <X size={12} className="mr-1" />
                                        Decline
                                    </button>

                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center shadow-lg">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-gray-700/50 rounded-full">
                                <Bell className="text-gray-500" size={24} />
                            </div>
                        </div>
                        <h4 className="text-lg font-medium text-gray-300">No Active Emergency Cases</h4>
                        <p className="text-gray-400 mt-1">All current cases have been processed</p>
                    </div>
                )}
            </div>

            {/* Accepted Cases Section */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Accepted Cases</h3>
                    <div className="flex space-x-2 overflow-x-auto">
                        <button
                            className={`text-xs ${acceptedTab === "all" ? "bg-gray-700" : "bg-gray-800"} hover:bg-gray-600 px-3 py-1 rounded-full ${acceptedTab === "all" ? "text-gray-200" : "text-gray-400"} transition-colors`}
                            onClick={() => setAcceptedTab("all")}
                        >
                            All
                        </button>
                        {patientStatuses.map(status => (
                            <button
                                key={status}
                                className={`text-xs ${acceptedTab === status ? "bg-gray-700" : "bg-gray-800"} hover:bg-gray-600 px-3 py-1 rounded-full ${acceptedTab === status ? "text-gray-200" : "text-gray-400"} transition-colors whitespace-nowrap`}
                                onClick={() => setAcceptedTab(status)}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredAcceptedCases.length > 0 ? (
                    <div className="space-y-4">
                        {filteredAcceptedCases.map(patient => (
                            <div
                                key={patient.id}
                                className="bg-gray-800 rounded-xl border border-gray-700 p-4 shadow-lg hover:border-gray-600 transition-colors"
                            >
                                <div className="flex items-start">
                                    <div className={`w-3 h-3 ${getPriorityColor(patient.priority)} rounded-full mt-2 mr-3`}></div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-medium">{patient.patientName}</h4>
                                                <p className="text-sm text-gray-400">{patient.id}</p>
                                            </div>
                                            {/* <div className="bg-gray-700 rounded-lg px-3 py-1 text-sm flex items-center">
                                                <Clock size={14} className="mr-1 text-cyan-500" />
                                                <span>Accepted: {patient.acceptedAt}</span>
                                            </div> */}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm mb-3">
                                            <div>
                                                <p className="text-gray-400">Condition</p>
                                                <p>{patient.condition}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400">Paramedic</p>
                                                <p>{patient.paramedic}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400">Current Status</p>
                                                <div className="flex items-center">
                                                    {patient.status === "at the accident site" && <MapPin size={14} className="mr-1 text-red-500" />}
                                                    {patient.status === "picked up by ambulance" && <Ambulance size={14} className="mr-1 text-amber-500" />}
                                                    {patient.status === "on the way" && <Ambulance size={14} className="mr-1 text-blue-500" />}
                                                    {patient.status === "arrived at hospital" && <Bed size={14} className="mr-1 text-cyan-500" />}
                                                    {patient.status === "in treatment" && <Bed size={14} className="mr-1 text-green-500" />}
                                                    <span className="capitalize">{patient.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-sm bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                                            <p className="text-gray-300">{patient.notes}</p>
                                        </div>

                                        {/* Status Update Section */}
                                        <div className="mt-3 pt-3 border-t border-gray-700">
                                            <p className="text-sm text-gray-400 mb-2">Update Patient Status:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {patientStatuses.map(status => (
                                                    <button
                                                        key={status}
                                                        className={`text-xs px-3 py-1 rounded-full transition-colors flex items-center
                              ${patient.status === status
                                                                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                                                                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                                                        onClick={() => updatePatientStatus(patient.id, status)}
                                                        disabled={patient.status === status}
                                                    >
                                                        {status === "at the accident site" && <MapPin size={12} className="mr-1" />}
                                                        {status === "picked up by ambulance" && <Ambulance size={12} className="mr-1" />}
                                                        {status === "on the way" && <Ambulance size={12} className="mr-1" />}
                                                        {status === "arrived at hospital" && <Bed size={12} className="mr-1" />}
                                                        {status === "in treatment" && <Bed size={12} className="mr-1" />}
                                                        <span className="capitalize">{status}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end mt-3 space-x-2">
                                    <button className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-full text-cyan-400 transition-colors flex items-center">
                                        <FileText size={12} className="mr-1" />
                                        Patient History
                                    </button>
                                    <button className="text-xs bg-gradient-to-r from-cyan-500 to-purple-600 px-3 py-1 rounded-full text-white transition-colors flex items-center">
                                        <Bed size={12} className="mr-1" />
                                        Assign Room
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center shadow-lg">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-gray-700/50 rounded-full">
                                <Ambulance className="text-gray-500" size={24} />
                            </div>
                        </div>
                        <h4 className="text-lg font-medium text-gray-300">No Accepted Cases</h4>
                        <p className="text-gray-400 mt-1">When you accept an emergency case, it will appear here</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmergencyCasesComponent;