const axios = require('axios');
const fs = require('fs');
const path = require('path');

const wait = (ms) => new Promise(r => setTimeout(r, ms));

async function syncAllBanlists() {
  console.log('[Sync] Đang tải danh sách ngày cập nhật từ YGOPRODeck...');
  const resDates = await axios.get('https://ygoprodeck.com/api/banlist/getBanListDates.php');
  const allDates = resDates.data;

  // Thu thập danh sách ngày từ năm 2022 trở đi cho TCG, OCG và Master Duel
  const formatDates = {
    TCG: allDates.filter(d => d.type === 'TCG' && d.date >= '2022-01-01').sort((a,b) => a.date.localeCompare(b.date)),
    OCG: allDates.filter(d => d.type === 'OCG' && d.date >= '2022-01-01').sort((a,b) => a.date.localeCompare(b.date)),
    'Master Duel': allDates.filter(d => d.type === 'Master Duel' && d.date >= '2022-01-01').sort((a,b) => a.date.localeCompare(b.date))
  };

  const outputData = {
    TCG: {},
    OCG: {},
    'Master Duel': {}
  };

  for (const fmt of ['TCG', 'OCG', 'Master Duel']) {
    console.log(`\n=== Đang xử lý Format: ${fmt} (${formatDates[fmt].length} đợt cập nhật) ===`);
    let previousCardsMap = new Map();

    for (const d of formatDates[fmt]) {
      const monthKey = d.date.slice(0, 7);
      console.log(`[${fmt}] Tải dữ liệu đợt: ${d.date} (${monthKey})...`);
      
      try {
        const banUrl = `https://ygoprodeck.com/api/banlist/getBanList.php?list=${encodeURIComponent(fmt)}&date=${d.date}`;
        const banRes = await axios.get(banUrl);
        const currentCards = banRes.data || [];

        const currentMap = new Map();
        currentCards.forEach(c => {
          currentMap.set(Number(c.id), {
            id: Number(c.id),
            name: c.name,
            status: c.status_text,
            type: c.type
          });
        });

        // Tìm các lá mới bị phạt hoặc thay đổi trạng thái
        const changedCards = [];
        for (const [id, c] of currentMap.entries()) {
          const prev = previousCardsMap.get(id);
          if (!prev) {
            changedCards.push({
              id: c.id,
              name: c.name,
              status: c.status,
              prevStatus: 'Unlimited',
              isChange: true
            });
          } else if (prev.status !== c.status) {
            changedCards.push({
              id: c.id,
              name: c.name,
              status: c.status,
              prevStatus: prev.status,
              isChange: true
            });
          }
        }

        const fullCards = Array.from(currentMap.values()).map(c => ({
          id: c.id,
          name: c.name,
          status: c.status
        }));

        const statsHelper = (arr) => ({
          forbiddenCount: arr.filter(x => x.status === 'Forbidden').length,
          limitedCount: arr.filter(x => x.status === 'Limited').length,
          semiLimitedCount: arr.filter(x => x.status === 'Semi-Limited').length,
          totalCount: arr.length
        });

        outputData[fmt][monthKey] = {
          format: fmt,
          date: d.date,
          month: monthKey,
          year: Number(monthKey.slice(0, 4)),
          monthNum: Number(monthKey.slice(5, 7)),
          changeStats: statsHelper(changedCards),
          fullStats: statsHelper(fullCards),
          changedCards,
          fullCards
        };

        previousCardsMap = currentMap;
        await wait(300);
      } catch (err) {
        console.error(`[Error ${fmt} ${d.date}]`, err.message);
      }
    }
  }

  const savePath = path.join(__dirname, '../data/ygoprodeck_all_banlists.json');
  fs.writeFileSync(savePath, JSON.stringify(outputData, null, 2), 'utf8');
  console.log(`\n[Finish] Đã lưu thành công dữ liệu Banlist TCG, OCG, Master Duel vào: ${savePath}`);
  process.exit(0);
}

syncAllBanlists().catch(err => {
  console.error('[Fatal Error]', err);
  process.exit(1);
});
