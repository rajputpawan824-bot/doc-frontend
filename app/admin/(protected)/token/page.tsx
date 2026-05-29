// app/features/token-management/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Minus, 
  RefreshCw, 
  Key, 
  History, 
  Settings,
  Edit,
  Trash2,
  Check,
  X
} from "lucide-react";
import DataTable from "@/components/reusable/data-table";
import ReusableModal, { FormSection, FieldConfig } from "@/components/reusable/reusable-modal";
import { ColumnDef } from "@tanstack/react-table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Types
interface Token {
  id: string;
  token: string;
  prefix?: string;
  currentCount: number;
  maxCount?: number;
  autoReset: boolean;
  resetTime: string;
  lastReset: string;
  createdAt: string;
}

interface TokenHistory {
  id: string;
  tokenId: string;
  action: 'INCREMENT' | 'DECREMENT' | 'RESET' | 'CREATE' | 'UPDATE';
  previousCount: number;
  newCount: number;
  timestamp: string;
  performedBy: string;
}

// Mock data
const mockTokens: Token[] = [
  {
    id: "1",
    token: "VISIT-8A3F9B",
    prefix: "VISIT-",
    currentCount: 15,
    maxCount: 100,
    autoReset: true,
    resetTime: "00:00",
    lastReset: "2024-01-15",
    createdAt: "2024-01-01",
  },
  {
    id: "2",
    token: "API-4C2D8E",
    prefix: "API-",
    currentCount: 42,
    maxCount: 1000,
    autoReset: false,
    resetTime: "00:00",
    lastReset: "2024-01-14",
    createdAt: "2024-01-10",
  },
];

const mockHistory: TokenHistory[] = [
  {
    id: "1",
    tokenId: "1",
    action: "INCREMENT",
    previousCount: 14,
    newCount: 15,
    timestamp: "2024-01-15 10:30:00",
    performedBy: "Admin User",
  },
  {
    id: "2",
    tokenId: "1",
    action: "DECREMENT",
    previousCount: 15,
    newCount: 14,
    timestamp: "2024-01-15 09:15:00",
    performedBy: "System",
  },
  {
    id: "3",
    tokenId: "2",
    action: "RESET",
    previousCount: 50,
    newCount: 0,
    timestamp: "2024-01-15 00:00:00",
    performedBy: "Auto Reset",
  },
];

export default function TokenManagementPage() {
  const [tokens, setTokens] = useState<Token[]>(mockTokens);
  const [history, setHistory] = useState<TokenHistory[]>(mockHistory);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Token columns for DataTable
  const tokenColumns: ColumnDef<Token>[] = [
    {
      accessorKey: "token",
      header: "Token",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-blue-500" />
          <code className="bg-slate-100 px-2 py-1 rounded text-sm font-mono">
            {row.original.prefix}
            <span className="text-blue-600">{row.original.token.replace(row.original.prefix || '', '')}</span>
          </code>
        </div>
      ),
    },
    {
      accessorKey: "currentCount",
      header: "Current Count",
      cell: ({ row }) => (
        <Badge 
          variant={row.original.currentCount > 0 ? "default" : "secondary"}
          className="font-mono text-sm"
        >
          {row.original.currentCount}
          {row.original.maxCount && ` / ${row.original.maxCount}`}
        </Badge>
      ),
    },
    {
      accessorKey: "autoReset",
      header: "Auto Reset",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Switch 
            checked={row.original.autoReset} 
            onCheckedChange={(checked) => handleToggleAutoReset(row.original.id, checked)}
          />
          {row.original.autoReset && (
            <span className="text-xs text-slate-500">
              {row.original.resetTime}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "lastReset",
      header: "Last Reset",
      cell: ({ row }) => new Date(row.original.lastReset).toLocaleDateString(),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleIncrement(row.original.id)}
            title="Increment Token"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDecrement(row.original.id)}
            title="Decrement Token"
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleReset(row.original.id)}
            title="Reset Token"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSelectedToken(row.original);
              setIsEditMode(true);
              setIsModalOpen(true);
            }}
            title="Edit Token"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleViewHistory(row.original.id)}
            title="View History"
          >
            <History className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  // History columns for DataTable
  const historyColumns: ColumnDef<TokenHistory>[] = [
    {
      accessorKey: "timestamp",
      header: "Time",
      cell: ({ row }) => new Date(row.original.timestamp).toLocaleString(),
    },
    {
      accessorKey: "tokenId",
      header: "Token",
      cell: ({ row }) => {
        const token = tokens.find(t => t.id === row.original.tokenId);
        return token?.token || row.original.tokenId;
      },
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        const actionColors = {
          INCREMENT: "bg-green-100 text-green-800",
          DECREMENT: "bg-red-100 text-red-800",
          RESET: "bg-orange-100 text-orange-800",
          CREATE: "bg-blue-100 text-blue-800",
          UPDATE: "bg-purple-100 text-purple-800",
        };
        
        return (
          <Badge className={actionColors[row.original.action]}>
            {row.original.action}
          </Badge>
        );
      },
    },
    {
      accessorKey: "countChange",
      header: "Count Change",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="text-red-500">{row.original.previousCount}</span>
          <ArrowRight className="w-4 h-4 text-slate-400" />
          <span className="text-green-500">{row.original.newCount}</span>
        </div>
      ),
    },
    {
      accessorKey: "performedBy",
      header: "Performed By",
    },
  ];

  // ArrowRight icon component
  const ArrowRight = ({ className }: { className?: string }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );

  // Token form sections for ReusableModal
  const tokenFormSections: FormSection[] = [
    {
      title: "Token Configuration",
      icon: <Key className="w-4 h-4" />,
      fields: [
        {
          name: "prefix",
          label: "Token Prefix (Optional)",
          type: "text",
          placeholder: "e.g., VISIT-",
          width: "half",
        },
        {
          name: "maxCount",
          label: "Maximum Count (Optional)",
          type: "number",
          placeholder: "Leave empty for unlimited",
          width: "half",
          min: 1,
        },
        {
          name: "autoReset",
          label: "Auto-reset Daily",
          type: "checkbox",
          width: "full",
        },
        {
          name: "resetTime",
          label: "Reset Time",
          type: "time",
          width: "half",
          defaultValue: "00:00",
        },
      ] as FieldConfig[],
    },
  ];

  // Handler functions
  const handleIncrement = (tokenId: string) => {
    setTokens(prev => prev.map(token => {
      if (token.id === tokenId) {
        const newCount = token.currentCount + 1;
        
        // Add to history
        setHistory(prevHistory => [{
          id: Date.now().toString(),
          tokenId,
          action: "INCREMENT",
          previousCount: token.currentCount,
          newCount,
          timestamp: new Date().toISOString(),
          performedBy: "Admin User",
        }, ...prevHistory]);

        toast.success("Token incremented successfully");
        
        return { ...token, currentCount: newCount };
      }
      return token;
    }));
  };

  const handleDecrement = (tokenId: string) => {
    setTokens(prev => prev.map(token => {
      if (token.id === tokenId && token.currentCount > 0) {
        const newCount = token.currentCount - 1;
        
        // Add to history
        setHistory(prevHistory => [{
          id: Date.now().toString(),
          tokenId,
          action: "DECREMENT",
          previousCount: token.currentCount,
          newCount,
          timestamp: new Date().toISOString(),
          performedBy: "Admin User",
        }, ...prevHistory]);

        toast.success("Token decremented successfully");
        
        return { ...token, currentCount: newCount };
      }
      return token;
    }));
  };

  const handleReset = (tokenId: string) => {
    setTokens(prev => prev.map(token => {
      if (token.id === tokenId) {
        // Add to history
        setHistory(prevHistory => [{
          id: Date.now().toString(),
          tokenId,
          action: "RESET",
          previousCount: token.currentCount,
          newCount: 0,
          timestamp: new Date().toISOString(),
          performedBy: "Admin User",
        }, ...prevHistory]);

        toast.success("Token reset to zero");
        
        return { 
          ...token, 
          currentCount: 0,
          lastReset: new Date().toISOString().split('T')[0]
        };
      }
      return token;
    }));
  };

  const handleToggleAutoReset = (tokenId: string, enabled: boolean) => {
    setTokens(prev => prev.map(token => {
      if (token.id === tokenId) {
        toast.success(`Auto-reset ${enabled ? 'enabled' : 'disabled'}`);
        return { ...token, autoReset: enabled };
      }
      return token;
    }));
  };

  const handleViewHistory = (tokenId: string) => {
    const token = tokens.find(t => t.id === tokenId);
    setSelectedToken(token || null);
    setIsHistoryModalOpen(true);
  };

  const handleCreateToken = () => {
    setIsEditMode(false);
    setSelectedToken(null);
    setIsModalOpen(true);
  };

  const handleSaveToken = (data: Record<string, unknown>) => {
    if (isEditMode && selectedToken) {
      // Update existing token
      setTokens(prev => prev.map(token => {
        if (token.id === selectedToken.id) {
          const updatedToken = {
            ...token,
            prefix: data.prefix || "",
            maxCount: data.maxCount || undefined,
            autoReset: data.autoReset || false,
            resetTime: data.resetTime || "00:00",
          };
          
          // Add to history
          setHistory(prevHistory => [{
            id: Date.now().toString(),
            tokenId: selectedToken.id,
            action: "UPDATE",
            previousCount: token.currentCount,
            newCount: token.currentCount,
            timestamp: new Date().toISOString(),
            performedBy: "Admin User",
          }, ...prevHistory]);

          toast.success("Token updated successfully");
          
          return updatedToken;
        }
        return token;
      }));
    } else {
      // Create new token
      const newToken: Token = {
        id: Date.now().toString(),
        token: `${data.prefix || "TOKEN-"}${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        prefix: data.prefix || "",
        currentCount: 0,
        maxCount: data.maxCount || undefined,
        autoReset: data.autoReset || false,
        resetTime: data.resetTime || "00:00",
        lastReset: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString().split('T')[0],
      };
      
      setTokens(prev => [newToken, ...prev]);
      
      // Add to history
      setHistory(prevHistory => [{
        id: Date.now().toString(),
        tokenId: newToken.id,
        action: "CREATE",
        previousCount: 0,
        newCount: 0,
        timestamp: new Date().toISOString(),
        performedBy: "Admin User",
      }, ...prevHistory]);

      toast.success("Token created successfully");
    }
    
    setIsModalOpen(false);
  };

  const filteredHistory = selectedToken 
    ? history.filter(h => h.tokenId === selectedToken.id)
    : history;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Visit Token Management</h1>
          <p className="text-slate-600 mt-1">
            Manage visit tokens, track usage, and configure auto-reset settings
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleCreateToken}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Token
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsSettingsModalOpen(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-500">Total Tokens</p>
                <p className="text-2xl font-bold">{tokens.length}</p>
              </div>
              <Key className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-500">Active Tokens</p>
                <p className="text-2xl font-bold">
                  {tokens.filter(t => t.currentCount > 0).length}
                </p>
              </div>
              <Check className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-500">Auto-reset Enabled</p>
                <p className="text-2xl font-bold">
                  {tokens.filter(t => t.autoReset).length}
                </p>
              </div>
              <RefreshCw className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-500">Total Usage</p>
                <p className="text-2xl font-bold">
                  {tokens.reduce((sum, token) => sum + token.currentCount, 0)}
                </p>
              </div>
              <History className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tokens Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={tokenColumns}
            data={tokens}
            searchColumn="token"
            searchPlaceholder="Search tokens..."
            emptyMessage="No tokens found."
          />
        </CardContent>
      </Card>

      {/* Recent History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Recent Token Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={historyColumns}
            data={history.slice(0, 5)}
            searchColumn="action"
            searchPlaceholder="Search history..."
            emptyMessage="No history found."
          />
        </CardContent>
      </Card>

      {/* Token Modal */}
      <ReusableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveToken}
        title={isEditMode ? "Edit Token" : "Create New Token"}
        sections={tokenFormSections}
        initialData={selectedToken || {}}
        isEdit={isEditMode}
        size="md"
        saveButtonText={isEditMode ? "Update Token" : "Create Token"}
        cancelButtonText="Cancel"
      />

      {/* History Modal */}
      <ReusableModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onSave={() => {}} // Not needed for view-only modal
        title={`Token History: ${selectedToken?.token}`}
        size="xl"
        saveButtonText=""
        cancelButtonText="Close"
        saveButtonColor="transparent"
      >
        {isHistoryModalOpen && (
          <div className="p-4">
            <DataTable
              columns={historyColumns}
              data={filteredHistory}
              searchColumn="action"
              searchPlaceholder="Search history..."
              emptyMessage="No history found for this token."
            />
          </div>
        )}
      </ReusableModal>

      {/* Settings Modal - Custom component */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Token Management Settings
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Default Reset Time</Label>
                <Input type="time" defaultValue="00:00" />
                <p className="text-sm text-slate-500">
                  Default time for daily token resets
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Daily Auto-cleanup</Label>
                  <p className="text-sm text-slate-500">
                    Remove old history entries automatically
                  </p>
                </div>
                <Switch />
              </div>
              <div className="space-y-2">
                <Label>History Retention (days)</Label>
                <Input type="number" defaultValue="30" min="1" />
                <p className="text-sm text-slate-500">
                  How long to keep token history
                </p>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsSettingsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setIsSettingsModalOpen(false);
                  toast.success("Settings saved successfully");
                }}
              >
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
