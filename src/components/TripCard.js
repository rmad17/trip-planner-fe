import React from 'react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  DollarSign, 
  Plane, 
  Car, 
  Train, 
  Bus,
  ArrowRight,
  MoreVertical
} from 'lucide-react';

const TripCard = ({ trip, onSelect }) => {
  const getTravelIcon = (travelMode) => {
    const iconClass = "h-4 w-4";
    switch (travelMode) {
      case 'flight': return <Plane className={iconClass} />;
      case 'car': return <Car className={iconClass} />;
      case 'train': return <Train className={iconClass} />;
      case 'bus': return <Bus className={iconClass} />;
      default: return <MapPin className={iconClass} />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'completed': return 'status-completed';
      case 'planning': return 'status-pending';
      default: return 'status-pending';
    }
  };

  return (
    <div className="card-hover cursor-pointer group" onClick={() => onSelect(trip)}>
      {/* Header Image */}
      <div className="h-48 bg-accent-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-opacity-20"></div>
        
        {/* Top Row Actions */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <div className="bg-white bg-opacity-90 rounded-full p-2">
              {getTravelIcon(trip.travel_mode)}
            </div>
            <div className={`${getStatusColor(trip.status)} bg-opacity-90`}>
              {trip.status || 'Planning'}
            </div>
          </div>
          <button className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-colors">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>

        {/* Bottom Title */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h3 className="text-xl font-bold font-display mb-1 truncate">
            {trip.name || 'Untitled Trip'}
          </h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(trip.start_date)}</span>
            </div>
            {trip.start_date && trip.end_date && (
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{calculateDays(trip.start_date, trip.end_date)} days</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {/* Description */}
        {trip.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {trip.description}
          </p>
        )}
        
        {/* Tags */}
        {trip.tags && trip.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {trip.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-sage-100 text-sage-700 text-xs rounded-full font-medium"
              >
                #{tag}
              </span>
            ))}
            {trip.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                +{trip.tags.length - 3} more
              </span>
            )}
          </div>
        )}
        
        {/* Stats Row */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{trip.travellers_count || 1} {(trip.travellers_count || 1) === 1 ? 'traveller' : 'travellers'}</span>
            </div>
            {trip.budget && (
              <div className="flex items-center space-x-1">
                <DollarSign className="h-4 w-4" />
                <span>${trip.budget}</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {trip.completion_percentage !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600">Trip Progress</span>
              <span className="text-xs text-gray-600">{trip.completion_percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-accent-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${trip.completion_percentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Action Row */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Last updated {trip.updated_at ? new Date(trip.updated_at).toLocaleDateString() : 'recently'}
          </div>
          <div className="flex items-center space-x-2 text-primary-600 font-medium group-hover:text-primary-700 transition-colors">
            <span className="text-sm">View details</span>
            <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripCard;
