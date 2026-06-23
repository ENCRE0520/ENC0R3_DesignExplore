import SpeedWidget from '../components/widgets/SpeedWidget/SpeedWidget';
import MusicWidget from '../components/widgets/MusicWidget/MusicWidget';
import RecordingWidget from '../components/widgets/RecordingWidget/RecordingWidget';
import DeliveryWidget from '../components/widgets/DeliveryWidget/DeliveryWidget';
import FlightWidget from '../components/widgets/FlightWidget/FlightWidget';
import BucketWidget from '../components/widgets/BucketWidget/BucketWidget';
import ExpenseWidget from '../components/widgets/ExpenseWidget/ExpenseWidget';
import NextSongWidget from '../components/widgets/NextSongWidget/NextSongWidget';
import RadioWidget from '../components/widgets/RadioWidget/RadioWidget';
import StockWidget from '../components/widgets/StockWidget/StockWidget';
import FlameWidget from '../components/widgets/FlameWidget/FlameWidget';
import FormulaOneWidget from '../components/widgets/FormulaOneWidget/FormulaOneWidget';

const widgetData = [
  { id: 'speed', Component: SpeedWidget },
  { id: 'music', Component: MusicWidget },
  { id: 'recording', Component: RecordingWidget },
  { id: 'delivery', Component: DeliveryWidget },
  { id: 'flight', Component: FlightWidget },
  { id: 'bucket-list', Component: BucketWidget },
  { id: 'expense', Component: ExpenseWidget },
  { id: 'next-song', Component: NextSongWidget },
  { id: 'radio', Component: RadioWidget },
  { id: 'stock', Component: StockWidget },
  { id: 'flame', Component: FlameWidget },
  { id: 'formula-one', Component: FormulaOneWidget },
].map((item) => ({ ...item, controls: false }));

export default widgetData;
