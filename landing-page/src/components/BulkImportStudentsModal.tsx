import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Button, Modal } from '@/components';
import * as XLSX from 'xlsx';

interface BulkImportStudentsModalProps {
  classId: string;
  departmentId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function BulkImportStudentsModal({
  classId,
  departmentId,
  isOpen,
  onClose,
}: BulkImportStudentsModalProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);

  const importMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/admin/students/bulk', data);
    },
    onError: (error: any) => {
      const message = error?.userMessage || error?.message || 'Failed to import students';
      toast.error(message);
    },
    onSuccess: () => {
      toast.success('Students imported successfully!');
      void queryClient.invalidateQueries({ queryKey: ['students'] });
      resetAndClose();
    },
  });

  const resetAndClose = () => {
    setSelectedFile(null);
    setParsedData(null);
    setShowWarning(false);
    onClose();
  };

  const handleFileSelect = (file: File | null) => {
    if (!file) return;
    
    // Validate file type
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
    ];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast.error('Please upload a valid Excel or CSV file');
      return;
    }

    setSelectedFile(file);
  };

  const parseFile = async () => {
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = evt.target?.result;
        if (!data) throw new Error('Failed to read file');
        
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows: Array<Record<string, any>> = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        if (rows.length === 0) throw new Error('Excel file is empty');

        // Build a normalized-header map for matching flexible column names
        const normalize = (s: string) => s.replace(/[^a-z0-9]/gi, '').toLowerCase();

        let hasMissingRollNumber = false;

        const studentsPayload = rows.map((r, idx) => {
          // For each row, create a map of normalized header -> value
          const normalizedMap: Record<string, string> = {};
          for (const key of Object.keys(r)) {
            const val = r[key];
            if (val === undefined || val === null) continue;
            const nk = normalize(String(key));
            normalizedMap[nk] = String(val).trim();
          }

          const find = (patterns: string[]) => {
            for (const nk of Object.keys(normalizedMap)) {
              for (const p of patterns) {
                if (nk.includes(p)) return normalizedMap[nk];
              }
            }
            return '';
          };

          const email = find(['email']);
          const phone = find(['phone', 'mobile', 'contact']);
          const rollNumber = find(['rollnumber', 'roll', 'studentid', 'id', 'rollno']);
          const registrationNumber = find(['registrationnumber', 'registration', 'regno', 'reg']);
          const nameField = find(['name', 'fullname', 'studentname']);
          const firstName = find(['firstname', 'fname']);
          const lastName = find(['lastname', 'lname']);
          const name = (nameField || `${firstName} ${lastName}`.trim()).trim();

          if (!name) throw new Error(`Row ${idx + 2}: missing name`);
          if (!email) throw new Error(`Row ${idx + 2}: missing email`);
          if (!phone) throw new Error(`Row ${idx + 2}: missing phone`);

          // Track roll number presence
          if (!rollNumber) {
            hasMissingRollNumber = true;
          }

          // Normalize phone to digits only (keep as-is if empty after normalization)
          const phoneDigits = phone.replace(/\D/g, '');

          return {
            name,
            email,
            phone: phoneDigits || phone,
            rollNumber: rollNumber || undefined,
            registrationNumber: registrationNumber || undefined,
            classId: Number(classId),
            departmentId,
          };
        });

        setParsedData({ students: studentsPayload });

        // Show warning if roll numbers missing
        if (hasMissingRollNumber) {
          setShowWarning(true);
        } else {
          // If all rows have roll numbers, upload directly
          importMutation.mutate({ students: studentsPayload });
        }
      } catch (err: any) {
        toast.error(err?.message || 'Failed to parse file');
        setSelectedFile(null);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }
    parseFile();
  };

  const handleContinueImport = () => {
    if (parsedData) {
      importMutation.mutate(parsedData);
      setShowWarning(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  if (showWarning) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={resetAndClose}
        title="Auto-Generate Roll Numbers?"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 font-medium mb-2">
              Some students are missing roll numbers
            </p>
            <p className="text-sm text-yellow-700">
              Roll numbers will be automatically assigned sequentially starting from the next
              available number. Do you want to continue with the import?
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button onClick={resetAndClose} variant="secondary">
              Cancel
            </Button>
            <Button
              onClick={handleContinueImport}
              variant="primary"
              disabled={importMutation.isPending}
            >
              {importMutation.isPending ? 'Importing...' : 'Continue'}
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title="Import Students from Excel"
      size="lg"
    >
      <div className="space-y-6">
        {/* Info banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Required Columns</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Name (or First Name + Last Name)</li>
            <li>• Email</li>
            <li>• Phone</li>
            <li>• Roll Number (optional - will auto-generate if missing)</li>
            <li>• Registration Number (optional)</li>
          </ul>
        </div>

        {/* Drag and drop area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files ? e.target.files[0] : null)}
          />

          {selectedFile ? (
            <div className="flex items-center justify-center gap-3">
              <Upload className="w-8 h-8 text-green-500" />
              <div className="text-left">
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="ml-4 text-red-500 hover:text-red-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div>
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                Drag and drop your Excel file here, or
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                browse files
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Supports .xlsx, .xls, and .csv files
              </p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button onClick={resetAndClose} variant="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            variant="primary"
            disabled={!selectedFile || importMutation.isPending}
          >
            {importMutation.isPending ? 'Uploading...' : 'Upload & Import'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
