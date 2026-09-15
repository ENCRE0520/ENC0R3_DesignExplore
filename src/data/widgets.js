import SpeedWidget from '../components/widgets/SpeedWidget/SpeedWidget';
import MusicWidget from '../components/widgets/MusicWidget/MusicWidget';
import RecordingWidget from '../components/widgets/RecordingWidget/RecordingWidget';
import DeliveryWidget from '../components/widgets/DeliveryWidget/DeliveryWidget';
import FlightWidget from '../components/widgets/FlightWidget/FlightWidget';
import BucketWidget from '../components/widgets/BucketWidget/BucketWidget';
import ExpenseWidget from '../components/widgets/ExpenseWidget/ExpenseWidget';
import NextSongWidget from '../components/widgets/NextSongWidget/NextSongWidget';
import NextSongWidgetLarge from '../components/widgets/NextSongWidgetLarge/NextSongWidgetLarge';
import NextSongCDWidget, { NextSongCDWidgetLarge } from '../components/widgets/NextSongCDWidget/NextSongCDWidget';
import RadioWidget from '../components/widgets/RadioWidget/RadioWidget';
import StockWidget from '../components/widgets/StockWidget/StockWidget';
import FlameWidget from '../components/widgets/FlameWidget/FlameWidget';
import FormulaOneWidget from '../components/widgets/FormulaOneWidget/FormulaOneWidget';
import RadioWidgetLarge from '../components/widgets/RadioWidgetLarge/RadioWidgetLarge';
import DailyEventWidget from '../components/widgets/DailyWidget/DailyEventWidget';
import DailyTodoWidget from '../components/widgets/DailyWidget/DailyTodoWidget';
import GreetingScreenWidget from '../components/widgets/GreetingScreenWidget/GreetingScreenWidget';
import ReceiptComputerWidget from '../components/widgets/ReceiptComputerWidget/ReceiptComputerWidget';
import WeatherWidget from '../components/widgets/WeatherWidget/WeatherWidget';
import WeatherDetailsWidget from '../components/widgets/WeatherWidget/WeatherDetailsWidget';

const widgetData = [
  { id: 'next-song-widget-large', label: 'Until I Found You — Wide', Component: NextSongWidgetLarge, layout: 'wide', requiresWebGPU: true, tags: ['interaction', 'motion', 'visual', 'audio'] },
  { id: 'next-song', label: 'Until I Found You', Component: NextSongWidget, requiresWebGPU: true, tags: ['interaction', 'motion', 'audio'] },
  { id: 'next-song-cd-widget-large', label: 'Until I Found You — CD Wide', Component: NextSongCDWidgetLarge, layout: 'wide', tags: ['interaction', 'motion', 'visual', 'audio'] },
  { id: 'next-song-cd', label: 'Until I Found You — CD', Component: NextSongCDWidget, tags: ['interaction', 'motion', 'visual', 'audio'] },
  { id: 'radio-widget-large', label: 'Radio — Wide', Component: RadioWidgetLarge, layout: 'wide', tags: ['interaction', 'visual', 'audio'] },
  { id: 'radio', label: 'Radio', Component: RadioWidget, tags: ['interaction', 'visual', 'audio'] },
  { id: 'daily-todo', label: 'Daily Todo', Component: DailyTodoWidget, layout: 'wide', tags: ['interaction', 'motion', 'productivity'] },
  { id: 'daily-event', label: 'Daily Event', Component: DailyEventWidget, tags: ['interaction', 'visual', 'productivity'] },
  { id: 'receipt-computer', label: 'Receipt Computer', Component: ReceiptComputerWidget, layout: 'wide', tags: ['interaction', 'motion', 'input'] },
  { id: 'greeting-screen', label: 'Greeting Screen', Component: GreetingScreenWidget, tags: ['motion', 'visual', 'type'] },
  { id: 'weather', label: 'Weather', Component: WeatherWidget, requiresWebGPU: true, tags: ['visual', 'data'] },
  { id: 'weather-details', label: 'Weather Details', Component: WeatherDetailsWidget, requiresWebGPU: true, tags: ['visual', 'data', 'type'] },
  { id: 'speed', label: 'Speed', Component: SpeedWidget, tags: ['motion', 'visual', 'data'] },
  { id: 'music', label: 'Music', Component: MusicWidget, tags: ['interaction', 'motion', 'audio'] },
  { id: 'recording', label: 'Recording', Component: RecordingWidget, tags: ['interaction', 'motion', 'audio'] },
  { id: 'delivery', label: 'Delivery', Component: DeliveryWidget, tags: ['visual', 'illustration'] },
  { id: 'flight', label: 'Flight', Component: FlightWidget, tags: ['visual', 'travel'] },
  { id: 'bucket-list', label: 'Bucket List', Component: BucketWidget, tags: ['motion', 'visual', 'content'] },
  { id: 'expense', label: 'Expense', Component: ExpenseWidget, tags: ['visual', 'data'] },
  { id: 'stock', label: 'Stock', Component: StockWidget, tags: ['interaction', 'motion', 'data'] },
  { id: 'flame', label: 'Flame', Component: FlameWidget, tags: ['motion', 'visual'] },
  { id: 'formula-one', label: 'Formula One', Component: FormulaOneWidget, tags: ['visual', 'data'] },
].map((item) => ({ ...item, category: 'prototypes', controls: false }));

export default widgetData;
