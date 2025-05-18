import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle,
  Clock,
  DollarSign,
  Search,
  XCircle,
  ChevronDown,
} from 'lucide-react';
const apiUrl = import.meta.env.VITE_API_URL;

const MobilePayment = () => {
  const [activeTab, setActiveTab] = useState('deposits');
  const [loading, setLoading] = useState(true);
  const [depositRequests, setDepositRequests] = useState([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [processStatus, setProcessStatus] = useState({
    isProcessing: false,
    requestId: null,
    action: null,
  });
  const [notification, setNotification] = useState(null);
  const [expandedRequest, setExpandedRequest] = useState(null);

  // Fetch deposit requests
  const fetchDepositRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/wallet/admin/pending-deposits`);
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        // Extract all deposit requests and add user information
        const allRequests = data.data.flatMap((wallet) =>
          wallet.depositRequests.map((request) => ({
            ...request,
            user: wallet.user,
            walletId: wallet._id,
          }))
        );
        setDepositRequests(allRequests);
      } else {
        setDepositRequests([]);
      }
    } catch (error) {
      console.error('Error fetching deposit requests:', error);
      showNotification(
        'Error',
        'Failed to load deposit requests. Please try again.',
        'error'
      );
      setDepositRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch withdrawal requests
  const fetchWithdrawalRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${apiUrl}/wallet/admin/pending-withdrawals`
      );
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        // Extract all withdrawal requests and add user information
        const allRequests = data.data.flatMap((wallet) =>
          wallet.withdrawalRequests.map((request) => ({
            ...request,
            user: wallet.user,
            walletId: wallet._id,
          }))
        );
        setWithdrawalRequests(allRequests);
      } else {
        setWithdrawalRequests([]);
      }
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error);
      showNotification(
        'Error',
        'Failed to load withdrawal requests. Please try again.',
        'error'
      );
      setWithdrawalRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Custom date formatter
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';

      const options = {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      };

      return new Intl.DateTimeFormat('en-US', options).format(date);
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Show notification
  const showNotification = (title, message, type = 'success') => {
    setNotification({ title, message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Process deposit action (approve/reject)
  const handleDepositAction = async (walletId, requestId, action) => {
    setProcessStatus({
      isProcessing: true,
      requestId,
      action,
    });

    try {
      const response = await fetch(
        `${apiUrl}/wallet/deposit/${walletId}/${requestId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        showNotification(
          'Success',
          `Deposit request ${action}ed successfully.`
        );
        // Refresh the deposit requests
        fetchDepositRequests();
      } else {
        throw new Error(data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error(`Error ${action}ing deposit:`, error);
      showNotification(
        'Error',
        `Failed to ${action} deposit request. Please try again.`,
        'error'
      );
    } finally {
      setProcessStatus({
        isProcessing: false,
        requestId: null,
        action: null,
      });
    }
  };

  // Process withdrawal action (approve/reject)
  const handleWithdrawalAction = async (walletId, requestId, action) => {
    setProcessStatus({
      isProcessing: true,
      requestId,
      action,
    });

    try {
      const response = await fetch(
        `${apiUrl}/wallet/withdraw/${walletId}/${requestId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        showNotification(
          'Success',
          `Withdrawal request ${action}ed successfully.`
        );
        // Refresh the withdrawal requests
        fetchWithdrawalRequests();
      } else {
        throw new Error(data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error(`Error ${action}ing withdrawal:`, error);
      showNotification(
        'Error',
        `Failed to ${action} withdrawal request. Please try again.`,
        'error'
      );
    } finally {
      setProcessStatus({
        isProcessing: false,
        requestId: null,
        action: null,
      });
    }
  };

  // Filter deposits based on search term
  const filteredDepositRequests = depositRequests.filter((request) => {
    const searchable = [
      request.user?.name,
      request.user?.email,
      request.amount?.toString(),
      request.transactionId,
      request.status,
    ]
      .join(' ')
      .toLowerCase();

    return searchable.includes(searchTerm.toLowerCase());
  });

  // Filter withdrawals based on search term
  const filteredWithdrawalRequests = withdrawalRequests.filter((request) => {
    const searchable = [
      request.user?.name,
      request.user?.email,
      request.amount?.toString(),
      request.paymentMethod,
      request.status,
      request.upiDetails?.upiId || '',
      request.bankDetails?.accountNumber || '',
      request.bankDetails?.bankName || '',
    ]
      .join(' ')
      .toLowerCase();

    return searchable.includes(searchTerm.toLowerCase());
  });

  // Toggle expanded request
  const toggleExpandRequest = (id) => {
    if (expandedRequest === id) {
      setExpandedRequest(null);
    } else {
      setExpandedRequest(id);
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <div className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" /> Approved
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" /> Rejected
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </div>
        );
      default:
        return (
          <div className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
            {status}
          </div>
        );
    }
  };

  // Load data on component mount and when tab changes
  useEffect(() => {
    if (activeTab === 'deposits') {
      fetchDepositRequests();
    } else {
      fetchWithdrawalRequests();
    }
  }, [activeTab]);

  // Render deposit request card
  const renderDepositCard = (request) => {
    const isExpanded = expandedRequest === request._id;

    return (
      <div
        key={request._id}
        className="mb-3 bg-white rounded-lg shadow-sm overflow-hidden"
      >
        <div
          className="p-3 flex justify-between items-center cursor-pointer"
          onClick={() => toggleExpandRequest(request._id)}
        >
          <div className="flex-1">
            <div className="font-medium">{request.user?.name || 'Unknown'}</div>
            <div className="text-gray-500 text-xs truncate">
              {request.user?.email}
            </div>
            <div className="mt-1 font-semibold text-green-700">
              ₹{request.amount.toLocaleString()}
            </div>
          </div>
          <div className="flex flex-col items-end">
            {getStatusBadge(request.status)}
            <div className="text-xs text-gray-500 mt-1">
              {formatDate(request.requestedAt)}
            </div>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 mt-1 transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </div>
        </div>

        {isExpanded && (
          <div className="p-3 pt-0 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <div className="text-xs text-gray-500">Transaction ID</div>
                <div className="text-sm font-medium">
                  {request.transactionId}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Date</div>
                <div className="text-sm">{formatDate(request.requestedAt)}</div>
              </div>
            </div>

            {request.status === 'pending' && (
              <div className="flex gap-2 mt-3">
                <button
                  className="flex-1 py-2 px-3 text-sm font-medium rounded-md text-white bg-green-600"
                  disabled={processStatus.isProcessing}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDepositAction(
                      request.walletId,
                      request._id,
                      'approve'
                    );
                  }}
                >
                  {processStatus.isProcessing &&
                  processStatus.requestId === request._id &&
                  processStatus.action === 'approve'
                    ? 'Processing...'
                    : 'Approve'}
                </button>
                <button
                  className="flex-1 py-2 px-3 text-sm font-medium rounded-md bg-white border border-red-300 text-red-600"
                  disabled={processStatus.isProcessing}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDepositAction(
                      request.walletId,
                      request._id,
                      'reject'
                    );
                  }}
                >
                  {processStatus.isProcessing &&
                  processStatus.requestId === request._id &&
                  processStatus.action === 'reject'
                    ? 'Processing...'
                    : 'Reject'}
                </button>
              </div>
            )}

            {request.status !== 'pending' && (
              <div className="text-xs text-gray-500 mt-2">
                {request.status === 'approved' ? 'Approved on' : 'Rejected on'}{' '}
                {request.resolvedAt ? formatDate(request.resolvedAt) : 'N/A'}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render withdrawal request card
  const renderWithdrawalCard = (request) => {
    const isExpanded = expandedRequest === request._id;

    return (
      <div
        key={request._id}
        className="mb-3 bg-white rounded-lg shadow-sm overflow-hidden"
      >
        <div
          className="p-3 flex justify-between items-center cursor-pointer"
          onClick={() => toggleExpandRequest(request._id)}
        >
          <div className="flex-1">
            <div className="font-medium">{request.user?.name || 'Unknown'}</div>
            <div className="text-gray-500 text-xs truncate">
              {request.user?.email}
            </div>
            <div className="mt-1 font-semibold text-red-700">
              ₹{request.amount.toLocaleString()}
            </div>
          </div>
          <div className="flex flex-col items-end">
            {getStatusBadge(request.status)}
            <div className="text-xs text-gray-500 mt-1">
              {formatDate(request.requestedAt)}
            </div>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 mt-1 transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </div>
        </div>

        {isExpanded && (
          <div className="p-3 pt-0 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <div className="text-xs text-gray-500">Payment Method</div>
                <div className="text-sm font-medium capitalize">
                  {request.paymentMethod}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Date</div>
                <div className="text-sm">{formatDate(request.requestedAt)}</div>
              </div>
            </div>

            <div className="mb-3">
              <div className="text-xs text-gray-500">Payment Details</div>
              {request.paymentMethod === 'upi' ? (
                <div className="text-sm">
                  <div className="font-medium">{request.upiDetails?.upiId}</div>
                  <div className="text-xs text-gray-500">UPI ID</div>
                </div>
              ) : (
                <div className="text-sm">
                  <div className="font-medium">
                    {request.bankDetails?.bankName}
                  </div>
                  <div className="text-xs text-gray-500">
                    A/C: {request.bankDetails?.accountNumber} (
                    {request.bankDetails?.ifscCode})
                  </div>
                  <div className="text-xs text-gray-500">
                    {request.bankDetails?.accountHolderName}
                  </div>
                </div>
              )}
            </div>

            {request.status === 'pending' && (
              <div className="flex gap-2 mt-3">
                <button
                  className="flex-1 py-2 px-3 text-sm font-medium rounded-md text-white bg-green-600"
                  disabled={processStatus.isProcessing}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWithdrawalAction(
                      request.walletId,
                      request._id,
                      'approve'
                    );
                  }}
                >
                  {processStatus.isProcessing &&
                  processStatus.requestId === request._id &&
                  processStatus.action === 'approve'
                    ? 'Processing...'
                    : 'Approve'}
                </button>
                <button
                  className="flex-1 py-2 px-3 text-sm font-medium rounded-md bg-white border border-red-300 text-red-600"
                  disabled={processStatus.isProcessing}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWithdrawalAction(
                      request.walletId,
                      request._id,
                      'reject'
                    );
                  }}
                >
                  {processStatus.isProcessing &&
                  processStatus.requestId === request._id &&
                  processStatus.action === 'reject'
                    ? 'Processing...'
                    : 'Reject'}
                </button>
              </div>
            )}

            {request.status !== 'pending' && (
              <div className="text-xs text-gray-500 mt-2">
                {request.status === 'approved' ? 'Approved on' : 'Rejected on'}{' '}
                {request.resolvedAt ? formatDate(request.resolvedAt) : 'N/A'}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div
          className={`p-3 mb-3 rounded-md mx-3 mt-3 ${
            notification.type === 'error'
              ? 'bg-red-50 border border-red-200 text-red-800'
              : 'bg-green-50 border border-green-200 text-green-800'
          }`}
        >
          <div className="flex items-center">
            {notification.type === 'error' ? (
              <AlertCircle className="h-4 w-4 mr-2" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            <div>
              <span className="font-semibold">{notification.title}:</span>{' '}
              {notification.message}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
        <h1 className="text-xl font-bold">Payment Management</h1>
        <p className="text-gray-500 text-sm">
          Manage deposit and withdrawal requests
        </p>

        {/* Search Bar */}
        {/* <div className="relative mt-3">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search requests..."
            className="w-full rounded-full py-2 pl-10 pr-4 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div> */}
      </div>

      {/* Summary Cards */}
      {/* <div className="grid grid-cols-2 gap-3 p-3">
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">Pending Deposits</div>
            <ArrowDown className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-xl font-bold mt-1">
            {depositRequests.filter((r) => r.status === 'pending').length}
          </div>
          <div className="text-xs text-gray-500">
            ₹
            {depositRequests
              .filter((r) => r.status === 'pending')
              .reduce((sum, req) => sum + req.amount, 0)
              .toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">Pending Withdrawals</div>
            <ArrowUp className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-xl font-bold mt-1">
            {withdrawalRequests.filter((r) => r.status === 'pending').length}
          </div>
          <div className="text-xs text-gray-500">
            ₹
            {withdrawalRequests
              .filter((r) => r.status === 'pending')
              .reduce((sum, req) => sum + req.amount, 0)
              .toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">Total Approved</div>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-xl font-bold mt-1">
            {depositRequests.filter((r) => r.status === 'approved').length +
              withdrawalRequests.filter((r) => r.status === 'approved').length}
          </div>
          <div className="text-xs text-gray-500">Last 24 hours</div>
        </div>

        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">Net Balance</div>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold mt-1">
            ₹
            {(
              depositRequests
                .filter((r) => r.status === 'approved')
                .reduce((sum, req) => sum + req.amount, 0) -
              withdrawalRequests
                .filter((r) => r.status === 'approved')
                .reduce((sum, req) => sum + req.amount, 0)
            ).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-gray-500">Total processed</div>
        </div>
      </div> */}

      {/* Tab Navigation */}
      <div className="flex bg-white shadow-sm mb-3">
        <button
          className={`flex-1 py-3 text-center font-medium text-sm ${
            activeTab === 'deposits'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('deposits')}
        >
          <ArrowDown className="w-4 h-4 mr-1 inline-block" /> Deposits
        </button>
        <button
          className={`flex-1 py-3 text-center font-medium text-sm ${
            activeTab === 'withdrawals'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('withdrawals')}
        >
          <ArrowUp className="w-4 h-4 mr-1 inline-block" /> Withdrawals
        </button>
      </div>

      {/* Request List */}
      <div className="px-3 pb-16">
        {activeTab === 'deposits' && (
          <>
            {loading ? (
              <div className="flex justify-center py-8 text-gray-500">
                Loading deposit requests...
              </div>
            ) : filteredDepositRequests.length === 0 ? (
              <div className="text-center py-8 flex flex-col items-center gap-2">
                <AlertCircle className="h-12 w-12 text-gray-300" />
                <p className="text-gray-500">No deposit requests found</p>
              </div>
            ) : (
              filteredDepositRequests.map(renderDepositCard)
            )}
          </>
        )}

        {activeTab === 'withdrawals' && (
          <>
            {loading ? (
              <div className="flex justify-center py-8 text-gray-500">
                Loading withdrawal requests...
              </div>
            ) : filteredWithdrawalRequests.length === 0 ? (
              <div className="text-center py-8 flex flex-col items-center gap-2">
                <AlertCircle className="h-12 w-12 text-gray-300" />
                <p className="text-gray-500">No withdrawal requests found</p>
              </div>
            ) : (
              filteredWithdrawalRequests.map(renderWithdrawalCard)
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MobilePayment;
