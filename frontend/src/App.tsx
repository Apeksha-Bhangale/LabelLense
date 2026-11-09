import React, { useState, useEffect } from 'react';
import { PageView, InspectionDetail } from './types';
import { fetchInspection } from './api';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { NewInspectionPage } from './pages/NewInspectionPage';
import { LabelCapturePage } from './pages/LabelCapturePage';
import { DeclarationReviewPage } from './pages/DeclarationReviewPage';
import { ComplianceResultsPage } from './pages/ComplianceResultsPage';
import { ReportPreviewPage } from './pages/ReportPreviewPage';
import { InspectionHistoryPage } from './pages/InspectionHistoryPage';
import { SavedInspectionDetailsPage } from './pages/SavedInspectionDetailsPage';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageView>('dashboard');
  const [activeInspectionId, setActiveInspectionId] = useState<string | null>(null);
  const [activeInspection, setActiveInspection] = useState<InspectionDetail | null>(null);
  const [loadingInspection, setLoadingInspection] = useState<boolean>(false);

  // Load active inspection when ID changes
  const loadActiveInspection = async (id: string, targetPage?: PageView) => {
    try {
      setLoadingInspection(true);
      const data = await fetchInspection(id);
      setActiveInspection(data);
      setActiveInspectionId(id);
      if (targetPage) {
        setCurrentPage(targetPage);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Could not load inspection details');
    } finally {
      setLoadingInspection(false);
    }
  };

  const handleInspectionCreated = (created: InspectionDetail) => {
    setActiveInspection(created);
    setActiveInspectionId(created.id);
    setCurrentPage('capture'); // Next step in workflow
  };

  const handleInspectionUpdated = (updated: InspectionDetail) => {
    setActiveInspection(updated);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Top Government Navbar */}
      <Navbar
        onNavigate={(page) => setCurrentPage(page)}
        activeInspectionId={activeInspectionId || undefined}
      />

      {/* Main Container: Sidebar + Page Content */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        <Sidebar
          currentPage={currentPage}
          onNavigate={(page) => setCurrentPage(page)}
          activeInspectionId={activeInspectionId || undefined}
          hasPanels={(activeInspection?.panels?.length || 0) > 0}
        />

        <main className="flex-1 overflow-y-auto">
          {currentPage === 'dashboard' && (
            <DashboardPage
              onNavigate={(page) => setCurrentPage(page)}
              onSelectInspection={(id, page) => loadActiveInspection(id, page)}
            />
          )}

          {currentPage === 'new_inspection' && (
            <NewInspectionPage
              onInspectionCreated={handleInspectionCreated}
              onNavigate={(page) => setCurrentPage(page)}
            />
          )}

          {currentPage === 'capture' && (
            activeInspection ? (
              <LabelCapturePage
                inspection={activeInspection}
                onInspectionUpdated={handleInspectionUpdated}
                onNavigate={(page) => setCurrentPage(page)}
              />
            ) : (
              <div className="p-12 text-center text-slate-500">
                Please select or create an inspection record first.
              </div>
            )
          )}

          {currentPage === 'declarations' && (
            activeInspection ? (
              <DeclarationReviewPage
                inspection={activeInspection}
                onInspectionUpdated={handleInspectionUpdated}
                onNavigate={(page) => setCurrentPage(page)}
              />
            ) : (
              <div className="p-12 text-center text-slate-500">
                Please select or create an inspection record first.
              </div>
            )
          )}

          {currentPage === 'compliance' && (
            activeInspection ? (
              <ComplianceResultsPage
                inspection={activeInspection}
                onInspectionUpdated={handleInspectionUpdated}
                onNavigate={(page) => setCurrentPage(page)}
              />
            ) : (
              <div className="p-12 text-center text-slate-500">
                Please select or create an inspection record first.
              </div>
            )
          )}

          {currentPage === 'report_preview' && (
            activeInspection ? (
              <ReportPreviewPage
                inspection={activeInspection}
                onInspectionUpdated={handleInspectionUpdated}
                onNavigate={(page) => setCurrentPage(page)}
              />
            ) : (
              <div className="p-12 text-center text-slate-500">
                Please select or create an inspection record first.
              </div>
            )
          )}

          {currentPage === 'history' && (
            <InspectionHistoryPage
              onSelectInspection={(id, page) => loadActiveInspection(id, page)}
              onNavigate={(page) => setCurrentPage(page)}
            />
          )}

          {currentPage === 'saved_details' && (
            activeInspection ? (
              <SavedInspectionDetailsPage
                inspection={activeInspection}
                onNavigate={(page) => setCurrentPage(page)}
                onSelectInspection={(id, page) => loadActiveInspection(id, page)}
              />
            ) : (
              <div className="p-12 text-center text-slate-500">
                Please select an inspection from History first.
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
