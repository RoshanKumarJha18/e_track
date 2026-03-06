import { useState, useEffect, useCallback } from 'react';
import { useUser, UserButton } from "@clerk/clerk-react";
import { FiShield, FiExternalLink, FiTrash2, FiCheckSquare, FiFileText, FiAlertCircle, FiCheckCircle, FiMap, FiX, FiFilter, FiRefreshCw, FiCalendar, FiBarChart2 } from 'react-icons/fi';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE_URL = RAW_API_URL.endsWith('/') ? RAW_API_URL.slice(0, -1) : RAW_API_URL;

// --- Mock Data for Authorized Recycling Centers ---
const authorizedRecyclingCenters = [
    { name: 'Green-Tech Recyclers, Nagpur', lat: 21.1458, lon: 79.0882, contact: { phone: '+919876543210', email: 'contact@gt-recyclers.com' } },
    { name: 'Eco-Waste Solutions, Pune', lat: 18.5204, lon: 73.8567, contact: { phone: '+919123456789', email: 'support@eco-waste.in' } },
    { name: 'Re-Cycle Earth, Mumbai', lat: 19.0760, lon: 72.8777, contact: { phone: '+919988776655', email: 'info@recycle-earth.org' } },
    { name: 'Enviro-Care Systems, Hyderabad', lat: 17.3850, lon: 78.4867, contact: { phone: '+919000011111', email: 'help@enviro-care.co' } },
];

// --- Haversine distance calculation ---
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // Distance in km
}

const AdminPortal = () => {
    const { user } = useUser();
    const [allReports, setAllReports] = useState([]); // Master list of all reports
    const [filteredReports, setFilteredReports] = useState([]); // Reports to display
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [filters, setFilters] = useState({
        status: 'all',
        severity: 'all',
        sortBy: 'newest',
    });
    const [stats, setStats] = useState({
        total: 0,
        new: 0,
        resolved: 0,
        today: 0,
        thisMonth: 0,
        severity: { low: 0, medium: 0, high: 0 },
    });

    const fetchReports = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
        const response = await fetch(`${API_BASE_URL}/api/reports`);
            if (!response.ok) {
                throw new Error('Failed to fetch reports.');
            }
            const data = await response.json();
            setAllReports(data);

            // Calculate stats
            const total = data.length;
            const newReports = data.filter(report => report.status === 'new').length;
            const resolvedReports = data.filter(report => report.status === 'resolved').length;

            // Calculate new stats
            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

            const todayCount = data.filter(r => new Date(r.createdAt) >= todayStart).length;
            const monthCount = data.filter(r => new Date(r.createdAt) >= monthStart).length;
            const severityCounts = data.reduce((acc, report) => {
                acc[report.severity] = (acc[report.severity] || 0) + 1;
                return acc;
            }, { low: 0, medium: 0, high: 0 });

            setStats({ total, new: newReports, resolved: resolvedReports, today: todayCount, thisMonth: monthCount, severity: severityCounts });

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    // Effect to apply filters whenever reports or filters change
    useEffect(() => {
        let reportsToFilter = [...allReports];

        // Filter by status
        if (filters.status !== 'all') {
            reportsToFilter = reportsToFilter.filter(report => report.status === filters.status);
        }

        // Filter by severity
        if (filters.severity !== 'all') {
            reportsToFilter = reportsToFilter.filter(report => report.severity === filters.severity);
        }

        // Sort by date
        if (filters.sortBy === 'newest') {
            reportsToFilter.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else {
            reportsToFilter.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        }

        setFilteredReports(reportsToFilter);
    }, [allReports, filters]);


    const handleDelete = async (reportId) => {
        if (!window.confirm('Are you sure you want to delete this report?')) return;

        try {
        const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete report.');
            }
            // Remove the report from the local state to update the UI
            const deletedReport = allReports.find(r => r._id === reportId);
            setAllReports(allReports.filter(report => report._id !== reportId));
            // Safely update stats based on the deleted report's status
            if (deletedReport) {
                setStats(prevStats => ({ ...prevStats, total: prevStats.total - 1, [deletedReport.status]: prevStats[deletedReport.status] - 1 }));
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleUpdateStatus = async (reportId, newStatus) => {
        try {
        const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!response.ok) {
                throw new Error('Failed to update status.');
            }
            const updatedReport = await response.json();
            // Update the report in the local state
            setAllReports(allReports.map(report => report._id === reportId ? updatedReport : report));
            setStats(prevStats => ({
                ...prevStats,
                new: prevStats.new - 1,
                resolved: prevStats.resolved + 1,
            }));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    const severityPieChartData = {
        labels: ['Low', 'Medium', 'High'],
        datasets: [
            {
                label: 'Reports by Severity',
                data: [stats.severity.low, stats.severity.medium, stats.severity.high],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.7)', // Blue
                    'rgba(245, 158, 11, 0.7)', // Yellow/Amber
                    'rgba(239, 68, 68, 0.7)',  // Red
                ],
            },
        ],
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-800 flex items-center">
                        <FiShield className="mr-2 text-blue-600" />
                        Government Admin Portal
                    </h1>
                    <UserButton afterSignOutUrl="/" />
                </div>
            </header>

            {/* Map Preview Modal Removed */}

            <main className="container mx-auto px-6 py-8">
                {/* Stats Dashboard */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Dashboard Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Stat Cards */}
                        <div className="space-y-6">
                            <div className="flex items-center">
                                <div className="bg-gray-100 p-3 rounded-full mr-4"><FiFileText className="text-gray-600" size={24} /></div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
                                    <p className="text-sm text-gray-500">Total Reports</p>
                                </div>
                            </div>
                             <div className="flex items-center">
                                <div className="bg-blue-100 p-3 rounded-full mr-4"><FiAlertCircle className="text-blue-600" size={24} /></div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-800">{stats.new}</p>
                                    <p className="text-sm text-gray-500">Pending Reports</p>
                                </div>
                            </div>
                             <div className="flex items-center">
                                <div className="bg-green-100 p-3 rounded-full mr-4"><FiCheckCircle className="text-green-600" size={24} /></div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-800">{stats.resolved}</p>
                                    <p className="text-sm text-gray-500">Resolved Reports</p>
                                </div>
                            </div>
                        </div>

                        {/* Pie Chart */}
                        <div className="lg:col-span-2 flex flex-col items-center justify-center">
                            <h3 className="font-bold text-gray-700 mb-2">Severity Distribution</h3>
                            <div className="w-full max-w-[300px] h-[300px]">
                                <Pie data={severityPieChartData} options={{ maintainAspectRatio: false }} />
                            </div>
                        </div>

                        {/* Time-based Stats */}
                        <div className="space-y-6">
                            <div className="flex items-center">
                                <div className="bg-purple-100 p-3 rounded-full mr-4"><FiCalendar className="text-purple-600" size={24} /></div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-800">{stats.today}</p>
                                    <p className="text-sm text-gray-500">Reports Today</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <div className="bg-indigo-100 p-3 rounded-full mr-4"><FiBarChart2 className="text-indigo-600" size={24} /></div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-800">{stats.thisMonth}</p>
                                    <p className="text-sm text-gray-500">Reports This Month</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Heatmap Section */}
                <div className="bg-white p-4 rounded-lg shadow-md mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">E-Waste Hotspot Map</h2>
                    <div className="h-[500px] w-full rounded-md overflow-hidden">
                        {isLoading ? <p>Loading map...</p> : (
                            <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                {filteredReports.map(report => {
                                    const severityColor = {
                                        low: 'blue',
                                        medium: 'yellow',
                                        high: 'red'
                                    };

                                    // Find the closest recycling center for this report
                                    let closestCenter = null;
                                    let minDistance = Infinity;

                                    authorizedRecyclingCenters.forEach(center => {
                                        const dist = getDistanceFromLatLonInKm(report.latitude, report.longitude, center.lat, center.lon);
                                        if (dist < minDistance) {
                                            minDistance = dist;
                                            closestCenter = center;
                                        }
                                    });

                                    return (
                                        <CircleMarker
                                            key={report._id}
                                            center={[report.latitude, report.longitude]}
                                            radius={8}
                                            pathOptions={{ color: severityColor[report.severity] || 'grey', fillColor: severityColor[report.severity] || 'grey', fillOpacity: 0.7 }}
                                        >
                                            <Popup>
                                                <div className="space-y-1">
                                                    <p><b>Description:</b> {report.description}</p>
                                                    <p><b>Status:</b> {report.status}</p>
                                                    <p><b>Severity:</b> {report.severity}</p>
                                                    <hr className="my-2"/>
                                                    {closestCenter && (
                                                        <div className="space-y-2">
                                                            <p className="text-sm text-green-700 font-semibold">
                                                                Closest Center: {closestCenter.name} ({minDistance.toFixed(1)} km away)
                                                            </p>
                                                            <p className="text-xs text-gray-600">
                                                                Contact: <a href={`tel:${closestCenter.contact.phone}`}>{closestCenter.contact.phone}</a> | <a href={`mailto:${closestCenter.contact.email}`}>Email</a>
                                                            </p>
                                                            <button onClick={() => alert(`Message sent to ${closestCenter.name} regarding this issue.`)} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded text-xs mt-1">
                                                                Send Message
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </Popup>
                                        </CircleMarker>
                                    );
                                })}
                            </MapContainer>
                        )}
                    </div>
                </div>

                {/* Filters Section */}
                <div className="bg-white p-4 rounded-lg shadow-md mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                        <div className="font-bold text-gray-700 flex items-center"><FiFilter className="mr-2" /> Filters</div>
                        <div>
                            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700">Status</label>
                            <select id="status-filter" name="status" onChange={handleFilterChange} value={filters.status} className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm">
                                <option value="all">All</option>
                                <option value="new">New</option>
                                <option value="resolved">Resolved</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="severity-filter" className="block text-sm font-medium text-gray-700">Severity</label>
                            <select id="severity-filter" name="severity" onChange={handleFilterChange} value={filters.severity} className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm">
                                <option value="all">All</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700">Sort by Date</label>
                            <select id="sort-by" name="sortBy" onChange={handleFilterChange} value={filters.sortBy} className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm">
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Recent Reports</h2>
                    <button 
                        onClick={fetchReports} 
                        disabled={isLoading}
                        className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FiRefreshCw className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        {isLoading ? 'Refreshing...' : 'Refresh Data'}
                    </button>
                </div>
                {isLoading && <p>Loading reports...</p>}
                {error && <p className="text-red-500">{error}</p>}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredReports.map((report) => (
                        <div key={report._id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                            {report.imageUrl && (
                                <img src={report.imageUrl} alt="E-waste report" className="w-full h-48 object-cover" />
                            )}
                            <div className="p-4 flex-grow">
                                <p className="text-gray-700 mb-2">{report.description}</p>
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                                        report.status === 'resolved' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {report.status}
                                    </span>
                                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                                        report.severity === 'high' ? 'bg-red-100 text-red-800' :
                                        report.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-blue-100 text-blue-800'
                                    }`}>
                                        {report.severity} Severity
                                    </span>
                                </div>
                                <div className="text-sm text-gray-500">
                                    <p className="mb-1">Date: {new Date(report.createdAt).toLocaleDateString()}</p>
                                    <div className="flex items-center space-x-4">
                                        <a href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline inline-flex items-center">
                                            <FiMap className="mr-1" />
                                            View Map
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 flex justify-end space-x-2">
                                {report.status === 'new' && (
                                    <button onClick={() => handleUpdateStatus(report._id, 'resolved')} className="text-sm text-green-600 hover:text-green-800 font-semibold flex items-center">
                                        <FiCheckSquare className="mr-1" /> Mark as Resolved
                                    </button>
                                )}
                                <button onClick={() => handleDelete(report._id)} className="text-sm text-red-600 hover:text-red-800 font-semibold flex items-center">
                                    <FiTrash2 className="mr-1" /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};


export default AdminPortal;   