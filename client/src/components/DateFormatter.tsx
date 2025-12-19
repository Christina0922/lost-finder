import React from 'react';
import { format, formatDistanceToNow, Locale } from 'date-fns';
import { ko, enUS, ja } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

interface DateFormatterProps {
  date: string | Date;
  formatType?: 'short' | 'long' | 'relative';
  className?: string;
}

const DateFormatter: React.FC<DateFormatterProps> = ({ 
  date, 
  formatType = 'short',
  className 
}) => {
  const { i18n } = useTranslation();
  
  const localeMap: { [key: string]: Locale } = {
    ko,
    en: enUS,
    ja,
  };

  const currentLocale = localeMap[i18n.language] || enUS;

  const formatDate = () => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }

    switch (formatType) {
      case 'relative':
        return formatDistanceToNow(dateObj, { 
          addSuffix: true, 
          locale: currentLocale 
        });
      case 'long':
        return format(dateObj, 'PPPP', { locale: currentLocale });
      case 'short':
      default:
        // 국가별 날짜 형식
        switch (i18n.language) {
          case 'ko':
            return format(dateObj, 'yyyy년 MM월 dd일', { locale: currentLocale });
          case 'ja':
            return format(dateObj, 'yyyy年MM月dd日', { locale: currentLocale });
          case 'en':
          default:
            return format(dateObj, 'MMM dd, yyyy', { locale: currentLocale });
        }
    }
  };

  return <span className={className}>{formatDate()}</span>;
};

export default DateFormatter;

