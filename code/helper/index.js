export const formattingDateTime = (obj) => {
    if (!obj) {
        return '';
    }

    let date = obj;

    if (typeof date === 'string') {
        date = new Date(obj);
    }

    return `${padNumber(date.getDate())}-${padNumber(getMonthName(date.getMonth()))}-${date.getFullYear()} : ${padNumber(date.getHours())}.${padNumber(date.getMinutes())}`;
};

const padNumber = (number) => {
    return (number < 10 ? '0' : '') + number;
};

const getMonthName = (month, type) => {
    if (!type || type === 'short') {
        return ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][month];
    }

    return ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][month];
};
