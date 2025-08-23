
import { 
  Users, 
  MapPin, 
  BarChart3, 
  Settings, 
  LogOut, 
  Plus,
  Trash2,
  Edit,
  Search,
  Menu,
  X,
  TrendingUp,
  Activity,
  Globe
} from 'lucide-react';
const StatCard = ({ title, value, icon: Icon, change, color = 'blue' }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 border-${color}-500`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {change !== undefined && (
          <p className={`text-sm mt-1 flex items-center ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className="w-4 h-4 mr-1" />
            {change >= 0 ? '+' : ''}{change}%
          </p>
        )}
      </div>
      <Icon className={`w-8 h-8 text-${color}-500`} />
    </div>
  </div>
);
export default StatCard;