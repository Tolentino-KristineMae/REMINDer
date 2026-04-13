import React, { useState, useEffect } from 'react';
import { Printer, FileText, Wallet2, CheckCircle2, Calendar, User, DollarSign, LayoutGrid, LayoutList } from 'lucide-react';
import api from '../../api/axios';
import { formatCurrency, formatDateLocal } from '../../utils/formatters';
import '../../styles/pages/Print/PrintPage.css';

const PrintPage = () => {
    const [selectedType, setSelectedType] = useState(''); // 'settlements' or 'utangs'
    const [selectedStatus, setSelectedStatus] = useState(''); // 'paid' or 'pending'
    const [selectedMonth, setSelectedMonth] = useState(''); // 'YYYY-MM' format
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [availableMonths, setAvailableMonths] = useState([]);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

    useEffect(() => {
        if (selectedType && selectedStatus) {
            fetchData();
        }
    }, [selectedType, selectedStatus, selectedMonth]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (selectedType === 'settlements') {
                const response = await api.get('/bills');
                const bills = response.data?.data || response.data?.bills || [];
                
                console.log('Fetched bills:', bills.length);
                console.log('Sample bill:', bills[0]);
                
                // Filter by status
                let filtered = bills.filter(bill => bill.status === selectedStatus);
                
                console.log('Filtered by status:', filtered.length);
                
                // Filter by month if selected - ALWAYS use due_date for settlements
                if (selectedMonth) {
                    filtered = filtered.filter(bill => {
                        const billDate = bill.due_date; // Always use due_date for month filtering
                        if (!billDate) return false;
                        const billMonth = billDate.substring(0, 7); // Get YYYY-MM
                        return billMonth === selectedMonth;
                    });
                    console.log('Filtered by month:', filtered.length);
                }
                
                setData(filtered);
                
                // Extract available months for filtering - ALWAYS from due_date
                if (!selectedMonth) {
                    const months = new Set();
                    bills.forEach(bill => {
                        if (bill.due_date) {
                            months.add(bill.due_date.substring(0, 7));
                        }
                    });
                    const monthsArray = Array.from(months).sort().reverse();
                    console.log('Available months:', monthsArray);
                    setAvailableMonths(monthsArray);
                }
            } else if (selectedType === 'utangs') {
                const response = await api.get('/debts', {
                    params: { status: selectedStatus }
                });
                const debts = response.data?.debts || [];
                
                console.log('Fetched debts:', debts.length);
                console.log('Sample debt:', debts[0]);
                
                // Filter by month if selected
                let filtered = debts;
                if (selectedMonth) {
                    filtered = debts.filter(debt => {
                        // For utangs: use created_at for pending, paid_at for paid
                        const debtDate = selectedStatus === 'paid' ? debt.paid_at : debt.created_at;
                        if (!debtDate) return false;
                        const debtMonth = debtDate.substring(0, 7);
                        return debtMonth === selectedMonth;
                    });
                    console.log('Filtered debts by month:', filtered.length);
                }
                
                setData(filtered);
                
                // Extract available months
                if (!selectedMonth) {
                    const months = new Set();
                    debts.forEach(debt => {
                        // For utangs: use created_at for pending, paid_at for paid
                        const dateField = selectedStatus === 'paid' ? debt.paid_at : debt.created_at;
                        if (dateField) {
                            months.add(dateField.substring(0, 7));
                        }
                    });
                    const monthsArray = Array.from(months).sort().reverse();
                    console.log('Available debt months:', monthsArray);
                    setAvailableMonths(monthsArray);
                }
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelectItem = (id) => {
        setSelectedItems(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedItems.length === data.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(data.map(item => item.id));
        }
    };

    const handlePrint = () => {
        if (selectedItems.length === 0) {
            alert('Please select at least one item to print');
            return;
        }
        
        // Check if mobile device
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile) {
            // For mobile, show a message about saving as PDF
            const confirmPrint = window.confirm(
                'On mobile, use your browser\'s "Save as PDF" or "Print to PDF" option to save a copy.\n\nProceed to print?'
            );
            if (!confirmPrint) return;
        }
        
        window.print();
    };

    const getMonthName = (monthStr) => {
        if (!monthStr) return '';
        const [year, month] = monthStr.split('-');
        const date = new Date(year, parseInt(month) - 1);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    };

    const selectedData = data.filter(item => selectedItems.includes(item.id));

    return (
        <div className="print-page">
            {/* Screen View - Selection Interface */}
            <div className="screen-only">
                <div className="print-header">
                    <div className="print-header-content">
                        <div className="print-title-section">
                            <div className="print-icon-wrapper">
                                <Printer size={32} />
                            </div>
                            <div>
                                <h1 className="print-title">Print Records</h1>
                                <p className="print-subtitle">Select and print detailed payment records</p>
                            </div>
                        </div>
                        {selectedType && selectedStatus && (
                            <button 
                                onClick={handlePrint}
                                disabled={selectedItems.length === 0}
                                className="print-button"
                            >
                                <Printer size={18} />
                                Print Selected ({selectedItems.length})
                            </button>
                        )}
                    </div>
                    
                    {/* Mobile Print Instructions */}
                    <div className="mobile-print-info">
                        <div className="info-icon">ℹ️</div>
                        <div className="info-content">
                            <p className="info-title">Mobile Users</p>
                            <p className="info-text">
                                On mobile, use your browser's "Save as PDF" or "Print to PDF" option to save a digital copy.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="print-content">
                    {/* Step 1: Select Type */}
                    <div className="selection-section">
                        <h2 className="section-title">Step 1: Select Record Type</h2>
                        <div className="type-cards grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                onClick={() => {
                                    setSelectedType('settlements');
                                    setSelectedStatus('');
                                    setData([]);
                                    setSelectedItems([]);
                                }}
                                className={`type-card ${selectedType === 'settlements' ? 'type-card-active' : ''}`}
                            >
                                <div className="type-card-icon settlements">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h3 className="type-card-title">Settlements</h3>
                                <p className="type-card-description">Bills and payment records</p>
                            </button>

                            <button
                                onClick={() => {
                                    setSelectedType('utangs');
                                    setSelectedStatus('');
                                    setData([]);
                                    setSelectedItems([]);
                                }}
                                className={`type-card ${selectedType === 'utangs' ? 'type-card-active' : ''}`}
                            >
                                <div className="type-card-icon utangs">
                                    <Wallet2 size={32} />
                                </div>
                                <h3 className="type-card-title">Utangs</h3>
                                <p className="type-card-description">Debt and collection records</p>
                            </button>
                        </div>
                    </div>

                    {/* Step 2: Select Status */}
                    {selectedType && (
                        <div className="selection-section">
                            <h2 className="section-title">Step 2: Select Status</h2>
                            <div className="status-buttons grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <button
                                    onClick={() => {
                                        setSelectedStatus('paid');
                                        setSelectedMonth('');
                                        setSelectedItems([]);
                                    }}
                                    className={`status-button ${selectedStatus === 'paid' ? 'status-button-active' : ''}`}
                                >
                                    <CheckCircle2 size={20} />
                                    Paid / Settled
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedStatus('pending');
                                        setSelectedMonth('');
                                        setSelectedItems([]);
                                    }}
                                    className={`status-button ${selectedStatus === 'pending' ? 'status-button-active' : ''}`}
                                >
                                    <Calendar size={20} />
                                    Pending / Due
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Select Month (for both Settlements and Utangs) */}
                    {selectedType && selectedStatus && (
                        <div className="selection-section">
                            <h2 className="section-title">Step 3: Filter by Month (Optional)</h2>
                            <div className="month-filter">
                                <button
                                    onClick={() => {
                                        setSelectedMonth('');
                                        setSelectedItems([]);
                                    }}
                                    className={`month-button ${selectedMonth === '' ? 'month-button-active' : ''}`}
                                >
                                    All Months
                                </button>
                                {availableMonths.map(month => (
                                    <button
                                        key={month}
                                        onClick={() => {
                                            setSelectedMonth(month);
                                            setSelectedItems([]);
                                        }}
                                        className={`month-button ${selectedMonth === month ? 'month-button-active' : ''}`}
                                    >
                                        {getMonthName(month)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 4: Select Items */}
                    {selectedType && selectedStatus && (
                        <div className="selection-section">
                            <div className="items-header flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <h2 className="section-title mb-0">Step 4: Select Items to Print</h2>
                                <div className="flex items-center gap-2">
                                    {/* View Mode Toggle */}
                                    <div className="flex bg-white border border-gray-200 rounded-lg p-1">
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`p-2 rounded transition-all ${viewMode === 'list' ? 'bg-green-900 text-white' : 'text-gray-400 hover:text-gray-600'}`}
                                            title="List View"
                                        >
                                            <LayoutList size={18} />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`p-2 rounded transition-all ${viewMode === 'grid' ? 'bg-green-900 text-white' : 'text-gray-400 hover:text-gray-600'}`}
                                            title="Grid View"
                                        >
                                            <LayoutGrid size={18} />
                                        </button>
                                    </div>
                                    {data.length > 0 && (
                                        <button onClick={toggleSelectAll} className="select-all-button whitespace-nowrap">
                                            {selectedItems.length === data.length ? 'Deselect All' : 'Select All'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {loading ? (
                                <div className="loading-state">
                                    <div className="spinner"></div>
                                    <p>Loading records...</p>
                                </div>
                            ) : data.length === 0 ? (
                                <div className="empty-state">
                                    <FileText size={48} />
                                    <p>No records found</p>
                                </div>
                            ) : (
                                <div className={viewMode === 'grid' ? 'items-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'items-list'}>
                                    {data.map(item => (
                                        <div
                                            key={item.id}
                                            onClick={() => toggleSelectItem(item.id)}
                                            className={`item-card ${selectedItems.includes(item.id) ? 'item-card-selected' : ''}`}
                                        >
                                            <div className="item-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.includes(item.id)}
                                                    onChange={() => {}}
                                                />
                                            </div>
                                            <div className="item-details flex-1 min-w-0">
                                                <h4 className="item-title truncate">
                                                    {selectedType === 'settlements' ? item.details || item.name : item.description}
                                                </h4>
                                                <div className="item-meta flex-wrap">
                                                    {selectedType === 'settlements' && item.person_in_charge && (
                                                        <span className="item-meta-tag">
                                                            <User size={12} />
                                                            <span className="truncate">{item.person_in_charge.first_name} {item.person_in_charge.last_name}</span>
                                                        </span>
                                                    )}
                                                    {selectedType === 'utangs' && item.person_in_charge && (
                                                        <span className="item-meta-tag">
                                                            <User size={12} />
                                                            <span className="truncate">{item.person_in_charge.first_name} {item.person_in_charge.last_name}</span>
                                                        </span>
                                                    )}
                                                    <span className="item-meta-tag">
                                                        <Calendar size={12} />
                                                        <span className="truncate">
                                                            {(() => {
                                                                if (selectedType === 'settlements') {
                                                                    if (selectedStatus === 'paid') {
                                                                        const paymentDate = item.proof_of_payments?.[0]?.created_at;
                                                                        return paymentDate ? formatDateLocal(paymentDate) : 'No Date';
                                                                    } else {
                                                                        return item.due_date ? formatDateLocal(item.due_date) : 'No Date';
                                                                    }
                                                                } else {
                                                                    const dateValue = selectedStatus === 'paid' ? item.paid_at : item.created_at;
                                                                    return dateValue ? formatDateLocal(dateValue) : 'No Date';
                                                                }
                                                            })()}
                                                        </span>
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="item-amount whitespace-nowrap">
                                                {formatCurrency(item.amount)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Print View - Professional Document */}
            <div className="print-only">
                <div className="print-document">
                    {/* Document Header */}
                    <div className="document-header">
                        <div className="document-logo">
                            <div className="logo-circle">
                                <Printer size={32} />
                            </div>
                        </div>
                        <h1 className="document-title">REMINDear System</h1>
                        <h2 className="document-subtitle">
                            {selectedType === 'settlements' ? 'Settlement Records' : 'Utang Records'} - 
                            {selectedStatus === 'paid' ? ' Paid/Settled' : ' Pending/Due'}
                            {selectedMonth && ` - ${getMonthName(selectedMonth)}`}
                        </h2>
                        <p className="document-date">Generated: {new Date().toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}</p>
                    </div>

                    {/* Summary Section */}
                    <div className="document-summary">
                        <div className="summary-item">
                            <span className="summary-label">Total Records:</span>
                            <span className="summary-value">{selectedData.length}</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Total Amount:</span>
                            <span className="summary-value">{formatCurrency(selectedData.reduce((sum, item) => sum + parseFloat(item.amount), 0))}</span>
                        </div>
                    </div>

                    {/* Records Table */}
                    {selectedData.map((item, index) => (
                        <div key={item.id} className="record-section">
                            <div className="record-header">
                                <span className="record-number">Record #{index + 1}</span>
                                <span className="record-status">{selectedStatus === 'paid' ? 'PAID' : 'PENDING'}</span>
                            </div>

                            <div className="record-content">
                                <div className="record-main">
                                    <div className="record-field">
                                        <span className="field-label">
                                            {selectedType === 'settlements' ? 'Bill Details:' : 'Description:'}
                                        </span>
                                        <span className="field-value">
                                            {selectedType === 'settlements' ? item.details || item.name : item.description}
                                        </span>
                                    </div>

                                    <div className="record-field">
                                        <span className="field-label">Amount:</span>
                                        <span className="field-value amount">{formatCurrency(item.amount)}</span>
                                    </div>

                                    {item.person_in_charge && (
                                        <div className="record-field">
                                            <span className="field-label">Person in Charge:</span>
                                            <span className="field-value">
                                                {item.person_in_charge.first_name} {item.person_in_charge.last_name}
                                            </span>
                                        </div>
                                    )}

                                    {selectedType === 'settlements' && item.category && (
                                        <div className="record-field">
                                            <span className="field-label">Category:</span>
                                            <span className="field-value">{item.category.name}</span>
                                        </div>
                                    )}

                                    {selectedStatus === 'pending' && (
                                        <div className="record-field">
                                            <span className="field-label">Due Date:</span>
                                            <span className="field-value">
                                                {(() => {
                                                    const dateValue = selectedType === 'settlements' ? item.due_date : item.created_at;
                                                    return dateValue ? formatDateLocal(dateValue) : 'No Date';
                                                })()}
                                            </span>
                                        </div>
                                    )}

                                    {selectedStatus === 'paid' && (
                                        <>
                                            {selectedType === 'settlements' && item.due_date && (
                                                <div className="record-field">
                                                    <span className="field-label">Original Due Date:</span>
                                                    <span className="field-value">
                                                        {formatDateLocal(item.due_date)}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="record-field">
                                                <span className="field-label">Date Paid:</span>
                                                <span className="field-value">
                                                    {(() => {
                                                        let dateValue;
                                                        if (selectedType === 'settlements') {
                                                            dateValue = item.proof_of_payments?.[0]?.created_at;
                                                        } else {
                                                            dateValue = item.paid_at;
                                                        }
                                                        console.log('Payment date for item', item.id, ':', dateValue);
                                                        return dateValue ? formatDateLocal(dateValue) : 'No Date';
                                                    })()}
                                                </span>
                                            </div>
                                        </>
                                    )}

                                    {selectedType === 'settlements' && item.notes && (
                                        <div className="record-field full-width">
                                            <span className="field-label">Notes:</span>
                                            <span className="field-value">{item.notes}</span>
                                        </div>
                                    )}

                                    {selectedStatus === 'paid' && selectedType === 'settlements' && item.proof_of_payments?.[0]?.details && (
                                        <div className="record-field full-width">
                                            <span className="field-label">Payment Details:</span>
                                            <span className="field-value">{item.proof_of_payments[0].details}</span>
                                        </div>
                                    )}

                                    {selectedStatus === 'paid' && selectedType === 'utangs' && item.payment_details && (
                                        <div className="record-field full-width">
                                            <span className="field-label">Payment Details:</span>
                                            <span className="field-value">{item.payment_details}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Proof Image */}
                                {selectedStatus === 'paid' && (
                                    <>
                                        {selectedType === 'settlements' && item.proof_of_payments?.[0]?.file_path && (
                                            <div className="record-proof">
                                                <p className="proof-label">Payment Proof:</p>
                                                <img 
                                                    src={item.proof_of_payments[0].file_path} 
                                                    alt="Payment Proof" 
                                                    className="proof-image"
                                                />
                                            </div>
                                        )}
                                        {selectedType === 'utangs' && item.proof_image_path && (
                                            <div className="record-proof">
                                                <p className="proof-label">Payment Proof:</p>
                                                <img 
                                                    src={item.proof_image_path} 
                                                    alt="Payment Proof" 
                                                    className="proof-image"
                                                />
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Document Footer */}
                    <div className="document-footer">
                        <p className="footer-text">This is a computer-generated document from REMINDear System</p>
                        <p className="footer-text">Page printed on {new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrintPage;
