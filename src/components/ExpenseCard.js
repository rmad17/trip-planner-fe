import React from 'react';
import { 
  DollarSign, 
  Users, 
  Calendar, 
  Receipt, 
  CreditCard, 
  MapPin,
  MoreVertical,
  Check,
  X
} from 'lucide-react';

const ExpenseCard = ({ expense, onEdit, onDelete }) => {
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryIcon = (category) => {
    const iconClass = "h-4 w-4";
    switch (category) {
      case 'accommodation': return <div className={iconClass}>🏨</div>;
      case 'transportation': return <div className={iconClass}>🚗</div>;
      case 'food': return <div className={iconClass}>🍽️</div>;
      case 'activities': return <div className={iconClass}>🎭</div>;
      case 'shopping': return <div className={iconClass}>🛍️</div>;
      case 'medical': return <div className={iconClass}>💊</div>;
      default: return <DollarSign className={iconClass} />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'accommodation': return 'bg-blue-100 text-blue-800';
      case 'transportation': return 'bg-green-100 text-green-800';
      case 'food': return 'bg-orange-100 text-orange-800';
      case 'activities': return 'bg-purple-100 text-purple-800';
      case 'shopping': return 'bg-pink-100 text-pink-800';
      case 'medical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSplitStatusColor = (isPaid) => {
    return isPaid ? 'text-green-600' : 'text-orange-600';
  };

  return (
    <div className="card hover:shadow-medium transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${getCategoryColor(expense.category)}`}>
              {getCategoryIcon(expense.category)}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                {expense.title}
              </h3>
              <p className="text-sm text-gray-600">
                {expense.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {formatCurrency(expense.amount, expense.currency)}
              </div>
              <div className="text-xs text-gray-500">
                {expense.currency}
              </div>
            </div>
            <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Meta Information */}
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(expense.date)}</span>
          </div>
          
          {expense.location && (
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>{expense.location}</span>
            </div>
          )}
          
          {expense.payment_method && (
            <div className="flex items-center space-x-1">
              <CreditCard className="h-4 w-4" />
              <span className="capitalize">{expense.payment_method}</span>
            </div>
          )}
        </div>

        {/* Split Information */}
        {expense.splits && expense.splits.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Split between {expense.splits.length} {expense.splits.length === 1 ? 'person' : 'people'}
              </span>
              <span className="text-xs text-gray-500 capitalize">
                {expense.split_method} split
              </span>
            </div>
            
            <div className="space-y-1">
              {expense.splits.slice(0, 3).map((split, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                      {split.traveller_name?.charAt(0) || '?'}
                    </div>
                    <span>{split.traveller_name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">
                      {formatCurrency(split.amount, expense.currency)}
                    </span>
                    {split.is_paid ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-orange-600" />
                    )}
                  </div>
                </div>
              ))}
              
              {expense.splits.length > 3 && (
                <div className="text-xs text-gray-500 text-center pt-1">
                  +{expense.splits.length - 3} more people
                </div>
              )}
            </div>
          </div>
        )}

        {/* Receipt & Tags */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {expense.receipt_url && (
              <button className="flex items-center space-x-1 text-xs text-primary-600 hover:text-primary-700">
                <Receipt className="h-3 w-3" />
                <span>View Receipt</span>
              </button>
            )}
            
            {expense.tags && expense.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {expense.tags.slice(0, 2).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(expense)}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(expense)}
              className="text-xs text-red-600 hover:text-red-700 font-medium"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Payment Status */}
        {expense.splits && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Payment Status</span>
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  {expense.splits.map((split, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        split.is_paid ? 'bg-green-500' : 'bg-orange-500'
                      }`}
                    />
                  ))}
                </div>
                <span className={getSplitStatusColor(
                  expense.splits.every(split => split.is_paid)
                )}>
                  {expense.splits.filter(split => split.is_paid).length}/
                  {expense.splits.length} paid
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseCard;