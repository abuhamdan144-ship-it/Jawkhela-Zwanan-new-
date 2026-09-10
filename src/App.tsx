import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './components/AdminLayout';
import { DashboardHome } from './pages/admin/DashboardHome';
import { CollectionManager } from './pages/admin/CollectionManager';
import { BloodBank } from './pages/admin/BloodBank';
import { Settings } from './pages/admin/Settings';
import { Login } from './pages/admin/Login';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="bloodbank" element={<BloodBank />} />
          <Route path="programs" element={<CollectionManager collectionName="programs" title="Programs" template={{t: 'Title', c: 'Category', d: 'Desc', m: 'Meta', icon: 'book'}} />} />
          <Route path="projects" element={<CollectionManager collectionName="projects" title="Projects" template={{tag: 'Tag', t: 'Title', d: 'Desc', pct: 0, raised: '', goal: '', g: ['#000', '#fff']}} />} />
          <Route path="events" element={<CollectionManager collectionName="events" title="Events" template={{d: '12', mo: 'Jan', t: 'Event Title', w: 'When', s: 'Details', going: 0}} />} />
          <Route path="cabinet" element={<CollectionManager collectionName="cabinet" title="Team & Cabinet" template={{n: 'Name', r: 'Role', d: 'Bio', i: 'IN'}} />} />
          <Route path="stories" element={<CollectionManager collectionName="stories" title="Member Stories" template={{q: 'Quote', n: 'Name', w: 'Meta', i: 'IN'}} />} />
          <Route path="gallery" element={<CollectionManager collectionName="gallery" title="Gallery" template={{t: 'Title', c: 'Category', d: 'Desc', g: ['#000', '#fff']}} />} />
          <Route path="news" element={<CollectionManager collectionName="news" title="News" template={{title: 'News Title', date: 'YYYY-MM-DD'}} />} />
          <Route path="faqs" element={<CollectionManager collectionName="faqs" title="FAQs" template={{q: 'Question', a: 'Answer'}} />} />
          <Route path="volunteers" element={<CollectionManager collectionName="volunteers" title="Volunteers" template={{n: 'Name', p: 'Phone'}} />} />
          <Route path="newsletters" element={<CollectionManager collectionName="newsletterSubscribers" title="Newsletter Subscribers" template={{email: 'example@mail.com'}} />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </HashRouter>
  );
}
