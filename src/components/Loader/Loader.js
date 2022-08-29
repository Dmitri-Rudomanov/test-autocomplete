import s from './Loader.module.css';
import { Oval } from 'react-loader-spinner';

const Loader = () => {
  return (
    <div className={s.loader}>
      <Oval height="100" width="100" color="yellow" ariaLabel="loading" />
    </div>
  );
};

export default Loader;
