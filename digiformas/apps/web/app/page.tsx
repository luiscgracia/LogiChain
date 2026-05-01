"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Plus, 
  FileText, 
  Search, 
  Settings, 
  User,
  Menu,
  X,
  LogOut,
  Building2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Edit
} from "lucide-react";

const sedesDemo = [
  { id: 1, nombre: "Bucaramanga", prefijo: "BUC", consecutivos: 120, ultimo: "BUC-000120" },
  { id: 2, nombre: "Buenaventura", prefijo: "BUE", consecutivos: 245, ultimo: "BUE-000245", alerta: true },
  { id: 3, nombre: "Cartagena", prefijo: "CTG", consecutivos: 89, ultimo: "CTG-000089" },
  { id: 4, nombre: "Medellín", prefijo: "MED", consecutivos: 156, ultimo: "MED-000156" },
  { id: 5, nombre: "Bogotá (Puente Aranda)", prefijo: "BOG", consecutively: 250, ultimo: "BOG-000250", bloqueado: true },
];

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sedeSeleccionada, setSedeSeleccionada] = useState(sedesDemo[0]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">DigiFormas</span>
              </div>
            </div>

            {/* Selector de Sede */}
            <div className="hidden md:flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-400" />
              <select 
                value={sedeSeleccionada.id}
                onChange={(e) => setSedeSeleccionada(sedesDemo.find(s => s.id === Number(e.target.value))!}
                className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium"
              >
                {sedesDemo.map(sede => (
                  <option key={sede.id} value={sede.id}>{sede.nombre}</option>
                ))}
              </select>
            </div>

            {/* User menu */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-600" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">Gestión de Certificados de Habilitación</p>
          </div>
          <Link 
            href="/nuevo"
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo Certificado
          </Link>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">156</p>
                <p className="text-xs text-gray-500">Activos</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">23</p>
                <p className="text-xs text-gray-500">Borradores</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">1,245</p>
                <p className="text-xs text-gray-500">Completados</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">2</p>
                <p className="text-xs text-gray-500">Alertas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sedes table */}
        <div className="card">
          <h2 className="section-title">Estado por Sede</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Sede</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Consecutivo Actual</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Uso</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Estado</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sedesDemo.map(sede => (
                  <tr key={sede.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{sede.nombre}</td>
                    <td className="py-3 px-4 font-mono text-sm">{sede.ultimo}</td>
                    <td className="py-3 px-4">
                      <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                        <div 
                          className={`h-2 rounded-full ${
                            sede.consecutivos >= 250 ? 'bg-red-500' :
                            sede.consecutivos >= 240 ? 'bg-amber-500' :
                            'bg-primary-500'
                          }`}
                          style={{ width: `${(sede.consecutivos / 250) * 100}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {sede.bloqueado ? (
                        <span className="floating-badge badge-danger">Bloqueado</span>
                      ) : sede.alerta ? (
                        <span className="floating-badge badge-warning">Alerta</span>
                      ) : (
                        <span className="floating-badge badge-success">Normal</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link 
                        href={`/sede/${sede.id}`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        Ver →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent certificates */}
        <div className="card mt-6">
          <h2 className="section-title">Certificados Recientes</h2>
          <div className="space-y-3">
            {[
              { id: "BOG-000240", sede: "Bogotá", estado: "ACTIVO", hora: "Hace 2h" },
              { id: "CTG-000089", sede: "Cartagena", estado: "CERRADO", hora: "Hace 4h" },
              { id: "MED-000156", sede: "Medellín", estado: "BORRADOR", hora: "Hace 5h" },
              { id: "BUC-000120", sede: "Bucaramanga", estado: "ACTIVO", hora: "Ayer" },
            ].map((cert, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{cert.id}</p>
                    <p className="text-xs text-gray-500">{cert.sede}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`floating-badge ${
                    cert.estado === 'ACTIVO' ? 'badge-success' :
                    cert.estado === 'CERRADO' ? 'badge-info' :
                    'badge-warning'
                  }`}>
                    {cert.estado}
                  </span>
                  <span className="text-xs text-gray-400">{cert.hora}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}