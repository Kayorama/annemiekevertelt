'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Video, Plus, Settings, CreditCard, LogOut } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  thumbnail: string;
  status: 'draft' | 'rendering' | 'complete' | 'failed';
  updatedAt: string;
  duration: number;
}

interface CreditInfo {
  balance: number;
  pending: number;
}

export default function DashboardPage() {
  const { userId, signOut } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [credits, setCredits] = useState<CreditInfo>({ balance: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchDashboardData();
    }
  }, [userId]);

  const fetchDashboardData = async () => {
    try {
      const [projectsRes, creditsRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/credits'),
      ]);

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setProjects(projectsData);
      }

      if (creditsRes.ok) {
        const creditsData = await creditsRes.json();
        setCredits(creditsData);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800';
      case 'rendering':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Video className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">RenderOwl</span>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/credits"
                data-testid="credit-balance"
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
              >
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span data-testid="credit-amount" className="font-medium text-blue-900">
                  {credits.balance} credits
                </span>
              </Link>

              <button
                data-testid="user-menu-button"
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </button>

              <button
                onClick={() => signOut()}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 data-testid="dashboard-welcome" className="text-3xl font-bold text-gray-900">
            Your Projects
          </h1>
          <p className="mt-2 text-gray-600">
            Create, edit, and manage your video projects
          </p>
        </div>

        {/* New Project Button */}
        <div className="mb-8">
          <Link
            href="/editor/new"
            data-testid="new-project-button"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            New Project
          </Link>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
            <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-500 mb-4">Create your first video project to get started</p>
            <Link
              href="/editor/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/editor/${project.id}`}
                data-testid="video-card"
                className="group block bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="aspect-video bg-gray-200 relative">
                  {project.thumbnail ? (
                    <img
                      src={project.thumbnail}
                      alt={project.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <span
                    className={`absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      project.status
                    )}`}
                  >
                    {project.status}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {project.duration}s • {new Date(project.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
