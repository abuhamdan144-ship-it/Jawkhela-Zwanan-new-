const fs = require('fs');
let code = fs.readFileSync('src/pages/member/MemberPortal.tsx', 'utf8');

code = code.replace(
  "import { LogOut, Download, CheckCircle, ShieldCheck } from 'lucide-react';",
  "import { LogOut, Download, CheckCircle, ShieldCheck, FileText } from 'lucide-react';\nimport { jsPDF } from 'jspdf';"
);

const newDownloadLogic = `const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, { 
        scale: 3, 
        backgroundColor: '#020617', 
        useCORS: true 
      });
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = \`Zwanan_Member_\${member.name.replace(/\\s+/g, '_')}.png\`;
      link.href = url;
      link.click();
    } catch (err) {
      console.error('Error generating card image', err);
      alert('Failed to generate image. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, { 
        scale: 3, 
        backgroundColor: '#020617', 
        useCORS: true 
      });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [85.6, 53.98] // standard CR80 credit card size
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 53.98);
      pdf.save(\`Zwanan_Member_\${member.name.replace(/\\s+/g, '_')}.pdf\`);
    } catch (err) {
      console.error('Error generating PDF', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };`;

// replace handleDownload
code = code.replace(
  /const handleDownload = async \(\) => \{[\s\S]*?finally \{\s*setDownloading\(false\);\s*\}\s*\};/,
  newDownloadLogic
);

// replace the button
const newButtons = `<div className="flex gap-4 mt-8">
        <Button 
          onClick={handleDownloadImage} 
          disabled={downloading}
          variant="outline"
          className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 px-6 py-6 rounded-xl transition-all"
        >
          <Download className="w-5 h-5 mr-3" /> 
          Image (PNG)
        </Button>
        <Button 
          onClick={handleDownloadPDF} 
          disabled={downloading}
          className="bg-blue-600 hover:bg-blue-700 text-white border-0 px-6 py-6 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-105"
        >
          <FileText className="w-5 h-5 mr-3" /> 
          {downloading ? 'Generating...' : 'Download PDF Card'}
        </Button>
      </div>`;

code = code.replace(
  /<Button[\s\S]*?onClick=\{handleDownload\}[\s\S]*?<\/Button>/,
  newButtons
);

fs.writeFileSync('src/pages/member/MemberPortal.tsx', code);
