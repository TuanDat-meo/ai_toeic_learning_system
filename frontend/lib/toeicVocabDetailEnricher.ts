/**
 * TOEIC Vocabulary Detail Enricher
 * Cung cấp lời giải thích chi tiết ngữ cảnh, ví dụ câu song ngữ và collocations
 * cho toàn bộ từ vựng trọng tâm trong hệ thống.
 */

export interface DetailedVocabItem {
  word: string;
  pos: string;
  level: string;
  ipa: string;
  meaning: string;
  explanation: string;
  example: { en: string; vi: string };
  collocations: { en: string; vi: string }[];
  synonyms?: { en: string; vi: string }[];
}

export const CURATED_TOEIC_VOCAB: Record<string, Partial<DetailedVocabItem>> = {
  "picnic area": {
      "word": "picnic area",
      "pos": "n",
      "level": "A2",
      "ipa": "/ˈpɪknɪk ˈeəriə/",
      "meaning": "khu dã ngoại",
      "explanation": "Khu vực ngoài trời được bố trí bàn ghế để ăn uống hoặc sinh hoạt dã ngoại (trong công viên, khuôn viên ven hồ). Trong đề thi TOEIC Part 1, từ này thường đi kèm hành động như 'eating in a picnic area', 'sitting outdoors', 'relaxing in a park'.",
      "example": {
          "en": "She's eating lunch in a shaded picnic area.",
          "vi": "Cô ấy đang ăn trưa tại một khu vực dã ngoại rợp bóng mát."
      },
      "collocations": [
          {
              "en": "picnic table",
              "vi": "bàn ăn dã ngoại ngoài trời"
          },
          {
              "en": "designated picnic area",
              "vi": "khu vực dã ngoại được quy định"
          },
          {
              "en": "public picnic area",
              "vi": "khu dã ngoại công cộng"
          }
      ]
  },
  "wipe off": {
      "word": "wipe off",
      "pos": "v",
      "level": "B1",
      "ipa": "/waɪp ɔːf/",
      "meaning": "lau chùi sạch",
      "explanation": "Cụm động từ miêu tả hành động dùng khăn hoặc giẻ lau sạch bề mặt bàn, ghế, quầy hoặc cửa kính. Đây là hành động dọn dẹp điển hình trong nhà hàng, quán cà phê ở TOEIC Part 1.",
      "example": {
          "en": "The staff member is wiping off a table after customers leave.",
          "vi": "Nhân viên đang lau sạch bàn sau khi khách rời đi."
      },
      "collocations": [
          {
              "en": "wipe off the counter",
              "vi": "lau sạch mặt quầy"
          },
          {
              "en": "wipe off a bench",
              "vi": "lau sạch băng ghế dài"
          }
      ]
  },
  "bench": {
      "word": "bench",
      "pos": "n",
      "level": "A2",
      "ipa": "/bentʃ/",
      "meaning": "băng ghế dài",
      "explanation": "Ghế dài bằng gỗ hoặc kim loại tại công viên, sân ga hoặc hành lang. TOEIC Part 1 rất hay mô tả: 'sitting on a bench', 'unoccupied bench' (ghế trống) hoặc 'resting on a bench'.",
      "example": {
          "en": "Some pedestrians are resting on a wooden bench.",
          "vi": "Một vài người đi bộ đang ngồi nghỉ ngơi trên chiếc ghế băng bằng gỗ."
      },
      "collocations": [
          {
              "en": "park bench",
              "vi": "ghế băng trong công viên"
          },
          {
              "en": "wooden bench",
              "vi": "ghế băng gỗ"
          }
      ]
  },
  "brush off": {
      "word": "brush off",
      "pos": "v",
      "level": "B1",
      "ipa": "/brʌʃ ɔːf/",
      "meaning": "phủi đi, quét sạch",
      "explanation": "Hành động dùng tay hoặc bàn chải nhỏ quét/phủi bụi bẩn, tuyết khỏi quần áo hoặc nóc xe ô tô.",
      "example": {
          "en": "The driver is brushing snow off the car's windshield.",
          "vi": "Người lái xe đang gạt tuyết khỏi kính chắn gió của ô tô."
      },
      "collocations": [
          {
              "en": "brush off snow",
              "vi": "quét tuyết bám trên bề mặt"
          },
          {
              "en": "brush off dust",
              "vi": "phủi sạch bụi bẩn"
          }
      ]
  },
  "shovel": {
      "word": "shovel",
      "pos": "v",
      "level": "B2",
      "ipa": "/ˈʃʌvl/",
      "meaning": "xúc tuyết",
      "explanation": "Động từ xúc tuyết/xúc đất hoặc danh từ cái xẻng. Tranh mùa đông trong Part 1 hay xuất hiện cảnh công nhân xúc tuyết dọn đường đi (shoveling snow).",
      "example": {
          "en": "A worker is shoveling snow from the driveway.",
          "vi": "Một công nhân đang xúc dọn tuyết trên lối đi cho xe."
      },
      "collocations": [
          {
              "en": "shovel snow",
              "vi": "xúc dọn tuyết"
          },
          {
              "en": "snow shovel",
              "vi": "cái xẻng xúc tuyết chuyên dụng"
          }
      ]
  },
  "driveway": {
      "word": "driveway",
      "pos": "n",
      "level": "B1",
      "ipa": "/ˈdraɪvweɪ/",
      "meaning": "lối đi cho xe",
      "explanation": "Lối vào nhà riêng dành cho ô tô nối từ đường chính vào ga-ra hoặc sân nhà. Thường dùng trong bối cảnh nhà ở gia đình hoặc bãi đỗ trước nhà.",
      "example": {
          "en": "A vehicle is parked in front of the garage in the driveway.",
          "vi": "Một chiếc xe đang đỗ trước nhà để xe trên lối vào nhà."
      },
      "collocations": [
          {
              "en": "paved driveway",
              "vi": "lối đi lát gạch cho xe"
          },
          {
              "en": "private driveway",
              "vi": "lối vào nhà riêng biệt"
          }
      ]
  },
  "conversation": {
      "word": "conversation",
      "pos": "n",
      "level": "A2",
      "ipa": "/ˌkɑːnvərˈseɪʃn/",
      "meaning": "cuộc đối thoại",
      "explanation": "Cuộc trò chuyện giữa hai hay nhiều người. Cụm 'have a conversation' là đáp án đúng rất phổ biến khi thấy hai nhân vật đang đứng hoặc ngồi đối diện nói chuyện.",
      "example": {
          "en": "Two business associates are having a conversation in the hallway.",
          "vi": "Hai đối tác kinh doanh đang trò chuyện tại hành lang."
      },
      "collocations": [
          {
              "en": "have a conversation",
              "vi": "tiến hành cuộc trò chuyện"
          },
          {
              "en": "hold a conversation",
              "vi": "duy trì cuộc đàm đạo"
          }
      ]
  },
  "gallery": {
      "word": "gallery",
      "pos": "n",
      "level": "B1",
      "ipa": "/ˈɡæləri/",
      "meaning": "phòng triển lãm",
      "explanation": "Phòng triển lãm hoặc phòng trưng bày tranh nghệ thuật. Thường đi kèm các động từ: 'admiring artwork', 'hanging paintings', 'touring a gallery'.",
      "example": {
          "en": "Visitors are admiring framed paintings in the art gallery.",
          "vi": "Khách tham quan đang chiêm ngưỡng các bức tranh đóng khung trong phòng triển lãm."
      },
      "collocations": [
          {
              "en": "art gallery",
              "vi": "phòng triển lãm nghệ thuật"
          },
          {
              "en": "gallery exhibition",
              "vi": "buổi trưng bày tại triển lãm"
          }
      ]
  },
  "purchase": {
      "word": "purchase",
      "pos": "v",
      "level": "B1",
      "ipa": "/ˈpɜːrtʃəs/",
      "meaning": "mua hàng",
      "explanation": "Động từ mua hàng hoặc danh từ món hàng đã mua. Thường miêu tả cảnh khách hàng thanh toán tại quầy thu ngân (cash register) hoặc chọn đồ trong siêu thị.",
      "example": {
          "en": "A customer is making a purchase at the cashier counter.",
          "vi": "Khách hàng đang thanh toán mua hàng tại quầy thu ngân."
      },
      "collocations": [
          {
              "en": "make a purchase",
              "vi": "thực hiện giao dịch mua hàng"
          },
          {
              "en": "purchase merchandise",
              "vi": "mua sắm hàng hóa"
          }
      ]
  },
  "display": {
      "word": "display",
      "pos": "v",
      "level": "B1",
      "ipa": "/dɪˈspleɪ/",
      "meaning": "trưng bày",
      "explanation": "Động từ trưng bày hoặc danh từ khu trưng bày hàng hóa. Đáp án thường gặp: 'goods are on display' hoặc 'merchandise is displayed on racks'.",
      "example": {
          "en": "Various garments are displayed on racks under the tent.",
          "vi": "Nhiều loại trang phục đang được trưng bày trên các giá treo dưới lều."
      },
      "collocations": [
          {
              "en": "on display",
              "vi": "đang được trưng bày bày bán"
          },
          {
              "en": "display window",
              "vi": "ô kính trưng bày của cửa hàng"
          }
      ]
  },
  "tent": {
      "word": "tent",
      "pos": "n",
      "level": "A2",
      "ipa": "/tent/",
      "meaning": "lều bạt",
      "explanation": "Lều bạt dựng ngoài trời tại các hội chợ, chợ phiên hoặc sự kiện ngoài trời để che nắng mưa cho hàng hóa.",
      "example": {
          "en": "Market stalls are set up beneath large white tents.",
          "vi": "Các gian hàng chợ được dựng dưới những chiếc lều lớn màu trắng."
      },
      "collocations": [
          {
              "en": "outdoor tent",
              "vi": "lều bạt ngoài trời"
          },
          {
              "en": "pitch a tent",
              "vi": "dựng lều"
          }
      ]
  },
  "rack": {
      "word": "rack",
      "pos": "n",
      "level": "B1",
      "ipa": "/ræk/",
      "meaning": "giá treo",
      "explanation": "Giá treo hoặc giá kệ để quần áo, tài liệu, hành lý (clothing rack, magazine rack, luggage rack).",
      "example": {
          "en": "Several shirts are hanging neatly from a metal rack.",
          "vi": "Một vài chiếc áo sơ mi đang được treo ngay ngắn trên giá kim loại."
      },
      "collocations": [
          {
              "en": "clothing rack",
              "vi": "giá treo quần áo"
          },
          {
              "en": "storage rack",
              "vi": "kệ để đồ lưu trữ"
          }
      ]
  },
  "electronic device": {
      "word": "electronic device",
      "pos": "n",
      "level": "B1",
      "ipa": "/ɪˌlekˈtrɑːnɪk dɪˈvaɪs/",
      "meaning": "thiết bị điện tử",
      "explanation": "Thiết bị điện tử (điện thoại thông minh, máy tính bảng, laptop, máy tính để bàn). Thường thấy nhân vật đang thao tác trên thiết bị (using an electronic device).",
      "example": {
          "en": "The engineer is operating a portable electronic device.",
          "vi": "Kỹ sư đang thao tác trên một thiết bị điện tử cầm tay."
      },
      "collocations": [
          {
              "en": "portable electronic device",
              "vi": "thiết bị điện tử di động"
          },
          {
              "en": "electronic equipment",
              "vi": "thiết bị điện tử chuyên dụng"
          }
      ]
  },
  "suspended": {
      "word": "suspended",
      "pos": "adj",
      "level": "B2",
      "ipa": "/səˈspendɪd/",
      "meaning": "được treo lơ lửng",
      "explanation": "Tính từ/quá khứ phân từ chỉ trạng thái được treo lơ lửng từ trần nhà hoặc giá đỡ (ví dụ đèn trần: lamps suspended from the ceiling).",
      "example": {
          "en": "Several lighting fixtures are suspended from the ceiling.",
          "vi": "Nhiều bộ đèn chiếu sáng được treo lơ lửng từ trần nhà."
      },
      "collocations": [
          {
              "en": "suspended from the ceiling",
              "vi": "được treo thả từ trần nhà"
          },
          {
              "en": "suspended lamp",
              "vi": "đèn thả trần"
          }
      ]
  },
  "rolled up": {
      "word": "rolled up",
      "pos": "adj",
      "level": "B1",
      "ipa": "/roʊld ʌp/",
      "meaning": "cuộn lại",
      "explanation": "Cụm tính từ miêu tả vật được cuộn tròn lại (thảm, áp phích, bản thiết kế, tay áo).",
      "example": {
          "en": "A carpet has been rolled up and placed in the corner.",
          "vi": "Một tấm thảm đã được cuộn lại và đặt trong góc phòng."
      },
      "collocations": [
          {
              "en": "rolled-up poster",
              "vi": "tấm áp phích được cuộn tròn"
          },
          {
              "en": "rolled-up sleeves",
              "vi": "tay áo được xắn gọn lên"
          }
      ]
  },
  "ceiling fixture": {
      "word": "ceiling fixture",
      "pos": "n",
      "level": "C1",
      "ipa": "/ˈsiːlɪŋ ˈfɪkstʃər/",
      "meaning": "thiết bị cố định trên trần",
      "explanation": "Bộ đèn hoặc thiết bị lắp cố định trên trần nhà (quạt trần, đèn chùm, hệ thống thông gió).",
      "example": {
          "en": "Light from the ceiling fixture illuminates the workspace.",
          "vi": "Ánh sáng từ bộ đèn trần chiếu sáng không gian làm việc."
      },
      "collocations": [
          {
              "en": "lighting fixture",
              "vi": "bộ thiết bị chiếu sáng"
          },
          {
              "en": "ceiling light",
              "vi": "đèn ốp trần"
          }
      ]
  },
  "reach toward": {
      "word": "reach toward",
      "pos": "v",
      "level": "B2",
      "ipa": "/riːtʃ təˈwɔːrd/",
      "meaning": "với tay về phía",
      "explanation": "Động từ chỉ động tác vươn tay hoặc với tay về phía một đồ vật để lấy hoặc kiểm tra.",
      "example": {
          "en": "A shopper is reaching toward a box on the upper shelf.",
          "vi": "Người mua hàng đang với tay về phía chiếc hộp trên kệ cao."
      },
      "collocations": [
          {
              "en": "reach for an item",
              "vi": "với tay lấy một món đồ"
          },
          {
              "en": "reach into a bag",
              "vi": "thò tay vào trong túi"
          }
      ]
  },
  "patio": {
      "word": "patio",
      "pos": "n",
      "level": "B2",
      "ipa": "/ˈpætiəʊ/",
      "meaning": "sân hiên ngoài trời",
      "explanation": "Khu vực sân hiên lát gạch phía sau hoặc bên hông nhà, thường bố trí bàn ghế để thư giãn hoặc ăn uống ngoài trời.",
      "example": {
          "en": "Tables and chairs are set up on the outdoor patio.",
          "vi": "Bàn và ghế được bố trí trên sân hiên ngoài trời."
      },
      "collocations": [
          {
              "en": "outdoor patio",
              "vi": "sân hiên ngoài trời"
          },
          {
              "en": "patio furniture",
              "vi": "bàn ghế sân hiên ngoài trời"
          }
      ]
  },
  "plug in": {
      "word": "plug in",
      "pos": "v",
      "level": "A2",
      "ipa": "/plʌɡ ɪn/",
      "meaning": "cắm điện",
      "explanation": "Cắm phích cắm điện vào ổ cắm trên tường để cấp nguồn cho thiết bị điện tử.",
      "example": {
          "en": "The technician is plugging in the power cord to the outlet.",
          "vi": "Kỹ thuật viên đang cắm dây nguồn vào ổ điện."
      },
      "collocations": [
          {
              "en": "plug in a cord",
              "vi": "cắm dây nguồn vào ổ"
          },
          {
              "en": "plug into an outlet",
              "vi": "cắm vào ổ cắm điện"
          }
      ]
  },
  "power cord": {
      "word": "power cord",
      "pos": "n",
      "level": "B1",
      "ipa": "/ˈpaʊər kɔːrd/",
      "meaning": "dây nguồn điện",
      "explanation": "Dây cắm nguồn điện dẫn điện từ ổ cắm vào thiết bị (máy tính, máy in, đèn bàn).",
      "example": {
          "en": "The power cord is connected to an electrical socket.",
          "vi": "Dây nguồn điện được nối vào ổ cắm điện."
      },
      "collocations": [
          {
              "en": "electrical cord",
              "vi": "dây điện nguồn"
          },
          {
              "en": "unplug the cord",
              "vi": "rút phích cắm điện"
          }
      ]
  },
  "outlet": {
      "word": "outlet",
      "pos": "n",
      "level": "B1",
      "ipa": "/ˈaʊtlet/",
      "meaning": "ổ cắm điện",
      "explanation": "Ổ cắm điện gắn trên tường nhà hoặc mặt sàn để cắm các phích cắm điện.",
      "example": {
          "en": "The charger is inserted into a wall outlet near the desk.",
          "vi": "Củ sạc được cắm vào ổ điện trên tường gần bàn làm việc."
      },
      "collocations": [
          {
              "en": "electrical outlet",
              "vi": "ổ cắm điện"
          },
          {
              "en": "wall outlet",
              "vi": "ổ cắm trên tường"
          }
      ]
  },
  "cushion": {
      "word": "cushion",
      "pos": "n",
      "level": "A2",
      "ipa": "/ˈkʊʃn/",
      "meaning": "gối đệm, đệm lót",
      "explanation": "Đệm ngồi hoặc gối tựa đặt trên ghế sofa, ghế bành nhằm tạo sự êm ái khi ngồi.",
      "example": {
          "en": "Several decorative cushions are arranged on the sofa.",
          "vi": "Một vài chiếc gối đệm trang trí được sắp xếp trên ghế sô-pha."
      },
      "collocations": [
          {
              "en": "seat cushion",
              "vi": "đệm lót ghế ngồi"
          },
          {
              "en": "sofa cushion",
              "vi": "gối tựa lưng sô-pha"
          }
      ]
  },
  "porch": {
      "word": "porch",
      "pos": "n",
      "level": "B1",
      "ipa": "/pɔːrtʃ/",
      "meaning": "hiên nhà",
      "explanation": "Hiên trước cửa nhà có mái che, thường đặt ghế xích đu hoặc ghế bập bênh để ngồi hóng mát.",
      "example": {
          "en": "A pair of rocking chairs is positioned on the front porch.",
          "vi": "Một đôi ghế bập bênh được đặt trên hiên trước nhà."
      },
      "collocations": [
          {
              "en": "front porch",
              "vi": "hiên trước nhà"
          },
          {
              "en": "porch railing",
              "vi": "lan can hiên nhà"
          }
      ]
  },
  "rocking chair": {
      "word": "rocking chair",
      "pos": "n",
      "level": "B1",
      "ipa": "/ˈrɑːkɪŋ tʃer/",
      "meaning": "ghế bập bênh",
      "explanation": "Ghế bập bênh có chân cong cho phép người ngồi đu đưa nhẹ nhàng thư giãn.",
      "example": {
          "en": "An empty rocking chair faces the garden on the patio.",
          "vi": "Một chiếc ghế bập bênh trống hướng ra khu vườn trên sân hiên."
      },
      "collocations": [
          {
              "en": "wooden rocking chair",
              "vi": "ghế bập bênh bằng gỗ"
          },
          {
              "en": "sit in a rocking chair",
              "vi": "ngồi trên ghế bập bênh"
          }
      ]
  },
  "stool": {
      "word": "stool",
      "pos": "n",
      "level": "B1",
      "ipa": "/stuːl/",
      "meaning": "ghế đẩu, ghế tròn không tựa tay",
      "explanation": "Ghế đẩu cao không có lưng tựa và tay vịn, thường đặt ở quầy bar, phòng thí nghiệm hoặc quầy bếp.",
      "example": {
          "en": "A line of bar stools is placed along the high counter.",
          "vi": "Một hàng ghế đẩu quầy bar được xếp dọc theo quầy cao."
      },
      "collocations": [
          {
              "en": "bar stool",
              "vi": "ghế đẩu quầy bar"
          },
          {
              "en": "wooden stool",
              "vi": "ghế đẩu bằng gỗ"
          }
      ]
  },
  "position": {
      "word": "position",
      "pos": "v",
      "level": "B1",
      "ipa": "/pəˈzɪʃn/",
      "meaning": "đặt vào vị trí",
      "explanation": "Động từ đặt/bố trí vật ở một vị trí cụ thể, hoặc danh từ vị trí/chức vụ công việc.",
      "example": {
          "en": "The microphone has been positioned in front of the speaker.",
          "vi": "Chiếc micro đã được bố trí ở phía trước diễn giả."
      },
      "collocations": [
          {
              "en": "positioned near",
              "vi": "được đặt ở gần vị trí..."
          },
          {
              "en": "in an upright position",
              "vi": "ở tư thế dựng đứng thẳng"
          }
      ]
  },
  "cabinet": {
      "word": "cabinet",
      "pos": "n",
      "level": "A2",
      "ipa": "/ˈkæbɪnət/",
      "meaning": "tủ nhiều ngăn kéo",
      "explanation": "Tủ có nhiều ngăn hoặc cánh đóng dùng để cất giữ tài liệu, đồ dùng nhà bếp hoặc vật tư văn phòng.",
      "example": {
          "en": "Office files are stored securely inside the metal cabinet.",
          "vi": "Hồ sơ văn phòng được cất giữ an toàn bên trong tủ tài liệu kim loại."
      },
      "collocations": [
          {
              "en": "filing cabinet",
              "vi": "tủ đựng hồ sơ tài liệu"
          },
          {
              "en": "kitchen cabinet",
              "vi": "tủ bếp đựng đồ"
          }
      ]
  },
  "building materials": {
      "word": "building materials",
      "pos": "n",
      "level": "B1",
      "ipa": "/ˈbɪldɪŋ məˈtɪriəlz/",
      "meaning": "vật liệu xây dựng",
      "explanation": "Vật liệu xây dựng (gạch, xi măng, gỗ, thanh thép) thường thấy tại các công trường thi công ở Part 1.",
      "example": {
          "en": "Stacks of building materials are piled near the construction site.",
          "vi": "Các chồng vật liệu xây dựng được chất đống gần công trường."
      },
      "collocations": [
          {
              "en": "construction materials",
              "vi": "vật liệu thi công công trình"
          },
          {
              "en": "unload building materials",
              "vi": "bốc dỡ vật liệu xây dựng"
          }
      ]
  },
  "shed": {
      "word": "shed",
      "pos": "n",
      "level": "B1",
      "ipa": "/ʃed/",
      "meaning": "nhà kho nhỏ để dụng cụ",
      "explanation": "Nhà kho nhỏ bằng gỗ hoặc kim loại nằm ở sân vườn dùng để cất nông cụ, máy cắt cỏ và đồ làm vườn.",
      "example": {
          "en": "Gardening tools are stored neatly inside the storage shed.",
          "vi": "Các dụng cụ làm vườn được cất gọn gàng bên trong nhà kho nhỏ."
      },
      "collocations": [
          {
              "en": "storage shed",
              "vi": "nhà kho chứa đồ nhỏ"
          },
          {
              "en": "tool shed",
              "vi": "nhà để dụng cụ cơ khí/làm vườn"
          }
      ]
  },
  "lawn": {
      "word": "lawn",
      "pos": "n",
      "level": "B1",
      "ipa": "/lɔːn/",
      "meaning": "bãi cỏ",
      "explanation": "Thảm cỏ, bãi cỏ được cắt tỉa gọn gàng trước hoặc sau nhà, trong công viên.",
      "example": {
          "en": "A maintenance worker is mowing the expansive green lawn.",
          "vi": "Nhân viên bảo dưỡng đang cắt thảm cỏ xanh rộng lớn."
      },
      "collocations": [
          {
              "en": "mow the lawn",
              "vi": "cắt tỉa bãi cỏ"
          },
          {
              "en": "front lawn",
              "vi": "thảm cỏ trước sân nhà"
          }
      ]
  },
  "temporary canopy": {
      "word": "temporary canopy",
      "pos": "n",
      "level": "B2",
      "ipa": "/ˈtempəreri ˈkænəpi/",
      "meaning": "mái che/lều bạt tạm thời",
      "explanation": "Từ loại Danh từ chỉ \"mái che/lều bạt tạm thời\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the temporary canopy during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến mái che/lều bạt tạm thời trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard temporary canopy",
              "vi": "mái che/lều bạt tạm thời tiêu chuẩn"
          },
          {
              "en": "manage the temporary canopy",
              "vi": "quản lý mái che/lều bạt tạm thời"
          }
      ]
  },
  "merchandise": {
      "word": "merchandise",
      "pos": "n",
      "level": "B2",
      "ipa": "/ˈmɜːrtʃəndaɪs/",
      "meaning": "hàng hóa",
      "explanation": "Từ loại Danh từ chỉ \"hàng hóa\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the merchandise during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến hàng hóa trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard merchandise",
              "vi": "hàng hóa tiêu chuẩn"
          },
          {
              "en": "manage the merchandise",
              "vi": "quản lý hàng hóa"
          }
      ]
  },
  "unload": {
      "word": "unload",
      "pos": "v",
      "level": "B1",
      "ipa": "/ˌʌnˈloʊd/",
      "meaning": "dỡ hàng xuống",
      "explanation": "Từ loại Động từ mang nghĩa \"dỡ hàng xuống\". Trong TOEIC Part 1, từ này thường được dùng ở dạng V-ing để miêu tả hành động đang diễn ra của nhân vật trong bức ảnh.",
      "example": {
          "en": "A staff member is preparing to unload according to company guidelines.",
          "vi": "Một nhân viên đang chuẩn bị dỡ hàng xuống theo đúng hướng dẫn của công ty."
      },
      "collocations": [
          {
              "en": "unload properly",
              "vi": "dỡ hàng xuống một cách chuẩn xác"
          },
          {
              "en": "need to unload",
              "vi": "cần phải dỡ hàng xuống"
          }
      ]
  },
  "luggage / baggage": {
      "word": "luggage / baggage",
      "pos": "n",
      "level": "A2",
      "ipa": "/ˈlʌɡɪdʒ/",
      "meaning": "hành lý va li",
      "explanation": "Từ loại Danh từ chỉ \"hành lý va li\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the luggage / baggage during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến hành lý va li trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard luggage / baggage",
              "vi": "hành lý va li tiêu chuẩn"
          },
          {
              "en": "manage the luggage / baggage",
              "vi": "quản lý hành lý va li"
          }
      ]
  },
  "storage rack": {
      "word": "storage rack",
      "pos": "n",
      "level": "B2",
      "ipa": "/ˈstɔːrɪdʒ ræk/",
      "meaning": "giá/kệ để đồ",
      "explanation": "Từ loại Danh từ chỉ \"giá/kệ để đồ\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the storage rack during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến giá/kệ để đồ trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard storage rack",
              "vi": "giá/kệ để đồ tiêu chuẩn"
          },
          {
              "en": "manage the storage rack",
              "vi": "quản lý giá/kệ để đồ"
          }
      ]
  },
  "terminal": {
      "word": "terminal",
      "pos": "n",
      "level": "B1",
      "ipa": "/ˈtɜːrmɪnl/",
      "meaning": "nhà ga sân bay/tàu",
      "explanation": "Từ loại Danh từ chỉ \"nhà ga sân bay/tàu\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the terminal during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến nhà ga sân bay/tàu trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard terminal",
              "vi": "nhà ga sân bay/tàu tiêu chuẩn"
          },
          {
              "en": "manage the terminal",
              "vi": "quản lý nhà ga sân bay/tàu"
          }
      ]
  },
  "kitchen towel": {
      "word": "kitchen towel",
      "pos": "n",
      "level": "A2",
      "ipa": "/ˈkɪtʃɪn ˈtaʊəl/",
      "meaning": "khăn lau bếp",
      "explanation": "Từ loại Danh từ chỉ \"khăn lau bếp\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the kitchen towel during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến khăn lau bếp trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard kitchen towel",
              "vi": "khăn lau bếp tiêu chuẩn"
          },
          {
              "en": "manage the kitchen towel",
              "vi": "quản lý khăn lau bếp"
          }
      ]
  },
  "oven": {
      "word": "oven",
      "pos": "n",
      "level": "A2",
      "ipa": "/ˈʌvn/",
      "meaning": "lò nướng",
      "explanation": "Từ loại Danh từ chỉ \"lò nướng\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the oven during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến lò nướng trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard oven",
              "vi": "lò nướng tiêu chuẩn"
          },
          {
              "en": "manage the oven",
              "vi": "quản lý lò nướng"
          }
      ]
  },
  "sink": {
      "word": "sink",
      "pos": "n",
      "level": "A2",
      "ipa": "/sɪŋk/",
      "meaning": "bồn rửa chén",
      "explanation": "Từ loại Danh từ chỉ \"bồn rửa chén\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the sink during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến bồn rửa chén trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard sink",
              "vi": "bồn rửa chén tiêu chuẩn"
          },
          {
              "en": "manage the sink",
              "vi": "quản lý bồn rửa chén"
          }
      ]
  },
  "shelving": {
      "word": "shelving",
      "pos": "n",
      "level": "B1",
      "ipa": "/ˈʃelvɪŋ/",
      "meaning": "hệ thống kệ sách/kệ tủ",
      "explanation": "Từ loại Danh từ chỉ \"hệ thống kệ sách/kệ tủ\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the shelving during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến hệ thống kệ sách/kệ tủ trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard shelving",
              "vi": "hệ thống kệ sách/kệ tủ tiêu chuẩn"
          },
          {
              "en": "manage the shelving",
              "vi": "quản lý hệ thống kệ sách/kệ tủ"
          }
      ]
  },
  "built-in": {
      "word": "built-in",
      "pos": "adj",
      "level": "B2",
      "ipa": "/ˌbɪlt ˈɪn/",
      "meaning": "được lắp âm/gắn cố định vào tường",
      "explanation": "Từ loại Tính từ biểu thị đặc điểm \"được lắp âm/gắn cố định vào tường\". Thường dùng để bổ nghĩa cho danh từ, mô tả trạng thái của đồ vật hoặc không gian làm việc.",
      "example": {
          "en": "All items in the office are kept in a built-in condition.",
          "vi": "Tất cả các vật dụng trong văn phòng đều được duy trì trong tình trạng được lắp âm/gắn cố định vào tường."
      },
      "collocations": [
          {
              "en": "remain built-in",
              "vi": "duy trì trạng thái được lắp âm/gắn cố định vào tường"
          },
          {
              "en": "highly built-in",
              "vi": "rất được lắp âm/gắn cố định vào tường"
          }
      ]
  },
  "light fixture": {
      "word": "light fixture",
      "pos": "n",
      "level": "B2",
      "ipa": "/laɪt ˈfɪkstʃər/",
      "meaning": "bộ đèn chiếu sáng",
      "explanation": "Từ loại Danh từ chỉ \"bộ đèn chiếu sáng\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the light fixture during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến bộ đèn chiếu sáng trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard light fixture",
              "vi": "bộ đèn chiếu sáng tiêu chuẩn"
          },
          {
              "en": "manage the light fixture",
              "vi": "quản lý bộ đèn chiếu sáng"
          }
      ]
  },
  "instrument": {
      "word": "instrument",
      "pos": "n",
      "level": "A2",
      "ipa": "/ˈɪnstrəmənt/",
      "meaning": "nhạc cụ",
      "explanation": "Từ loại Danh từ chỉ \"nhạc cụ\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the instrument during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến nhạc cụ trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard instrument",
              "vi": "nhạc cụ tiêu chuẩn"
          },
          {
              "en": "manage the instrument",
              "vi": "quản lý nhạc cụ"
          }
      ]
  },
  "perform": {
      "word": "perform",
      "pos": "v",
      "level": "B1",
      "ipa": "/pərˈfɔːrm/",
      "meaning": "biểu diễn, trình diễn",
      "explanation": "Từ loại Động từ mang nghĩa \"biểu diễn, trình diễn\". Trong TOEIC Part 1, từ này thường được dùng ở dạng V-ing để miêu tả hành động đang diễn ra của nhân vật trong bức ảnh.",
      "example": {
          "en": "A staff member is preparing to perform according to company guidelines.",
          "vi": "Một nhân viên đang chuẩn bị biểu diễn, trình diễn theo đúng hướng dẫn của công ty."
      },
      "collocations": [
          {
              "en": "perform properly",
              "vi": "biểu diễn, trình diễn một cách chuẩn xác"
          },
          {
              "en": "need to perform",
              "vi": "cần phải biểu diễn, trình diễn"
          }
      ]
  },
  "terrace": {
      "word": "terrace",
      "pos": "n",
      "level": "B2",
      "ipa": "/ˈterəs/",
      "meaning": "sân hiên nhà hàng",
      "explanation": "Từ loại Danh từ chỉ \"sân hiên nhà hàng\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the terrace during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến sân hiên nhà hàng trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard terrace",
              "vi": "sân hiên nhà hàng tiêu chuẩn"
          },
          {
              "en": "manage the terrace",
              "vi": "quản lý sân hiên nhà hàng"
          }
      ]
  },
  "arrange": {
      "word": "arrange",
      "pos": "v",
      "level": "B1",
      "ipa": "/əˈreɪndʒ/",
      "meaning": "sắp xếp, bày biện",
      "explanation": "Từ loại Động từ mang nghĩa \"sắp xếp, bày biện\". Trong TOEIC Part 1, từ này thường được dùng ở dạng V-ing để miêu tả hành động đang diễn ra của nhân vật trong bức ảnh.",
      "example": {
          "en": "A staff member is preparing to arrange according to company guidelines.",
          "vi": "Một nhân viên đang chuẩn bị sắp xếp, bày biện theo đúng hướng dẫn của công ty."
      },
      "collocations": [
          {
              "en": "arrange properly",
              "vi": "sắp xếp, bày biện một cách chuẩn xác"
          },
          {
              "en": "need to arrange",
              "vi": "cần phải sắp xếp, bày biện"
          }
      ]
  },
  "tabletop": {
      "word": "tabletop",
      "pos": "n",
      "level": "B1",
      "ipa": "/ˈteɪbltɑːp/",
      "meaning": "mặt bàn",
      "explanation": "Từ loại Danh từ chỉ \"mặt bàn\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the tabletop during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến mặt bàn trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard tabletop",
              "vi": "mặt bàn tiêu chuẩn"
          },
          {
              "en": "manage the tabletop",
              "vi": "quản lý mặt bàn"
          }
      ]
  },
  "disassemble": {
      "word": "disassemble",
      "pos": "v",
      "level": "B2",
      "ipa": "/ˌdɪsəˈsembl/",
      "meaning": "tháo rời linh kiện",
      "explanation": "Từ loại Động từ mang nghĩa \"tháo rời linh kiện\". Trong TOEIC Part 1, từ này thường được dùng ở dạng V-ing để miêu tả hành động đang diễn ra của nhân vật trong bức ảnh.",
      "example": {
          "en": "A staff member is preparing to disassemble according to company guidelines.",
          "vi": "Một nhân viên đang chuẩn bị tháo rời linh kiện theo đúng hướng dẫn của công ty."
      },
      "collocations": [
          {
              "en": "disassemble properly",
              "vi": "tháo rời linh kiện một cách chuẩn xác"
          },
          {
              "en": "need to disassemble",
              "vi": "cần phải tháo rời linh kiện"
          }
      ]
  },
  "beam": {
      "word": "beam",
      "pos": "n",
      "level": "B2",
      "ipa": "/biːm/",
      "meaning": "thanh xà gỗ, xà ngang",
      "explanation": "Từ loại Danh từ chỉ \"thanh xà gỗ, xà ngang\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the beam during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến thanh xà gỗ, xà ngang trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard beam",
              "vi": "thanh xà gỗ, xà ngang tiêu chuẩn"
          },
          {
              "en": "manage the beam",
              "vi": "quản lý thanh xà gỗ, xà ngang"
          }
      ]
  },
  "deck": {
      "word": "deck",
      "pos": "n",
      "level": "B1",
      "ipa": "/dek/",
      "meaning": "sàn hiên gỗ ngoài trời",
      "explanation": "Từ loại Danh từ chỉ \"sàn hiên gỗ ngoài trời\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the deck during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến sàn hiên gỗ ngoài trời trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard deck",
              "vi": "sàn hiên gỗ ngoài trời tiêu chuẩn"
          },
          {
              "en": "manage the deck",
              "vi": "quản lý sàn hiên gỗ ngoài trời"
          }
      ]
  },
  "dismantle": {
      "word": "dismantle",
      "pos": "v",
      "level": "C1",
      "ipa": "/dɪsˈmæntl/",
      "meaning": "tháo dỡ công trình",
      "explanation": "Từ loại Động từ mang nghĩa \"tháo dỡ công trình\". Trong TOEIC Part 1, từ này thường được dùng ở dạng V-ing để miêu tả hành động đang diễn ra của nhân vật trong bức ảnh.",
      "example": {
          "en": "A staff member is preparing to dismantle according to company guidelines.",
          "vi": "Một nhân viên đang chuẩn bị tháo dỡ công trình theo đúng hướng dẫn của công ty."
      },
      "collocations": [
          {
              "en": "dismantle properly",
              "vi": "tháo dỡ công trình một cách chuẩn xác"
          },
          {
              "en": "need to dismantle",
              "vi": "cần phải tháo dỡ công trình"
          }
      ]
  },
  "pavilion": {
      "word": "pavilion",
      "pos": "n",
      "level": "C1",
      "ipa": "/pəˈvɪliən/",
      "meaning": "nhà chòi, gian nhà ngoài trời",
      "explanation": "Từ loại Danh từ chỉ \"nhà chòi, gian nhà ngoài trời\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the pavilion during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến nhà chòi, gian nhà ngoài trời trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard pavilion",
              "vi": "nhà chòi, gian nhà ngoài trời tiêu chuẩn"
          },
          {
              "en": "manage the pavilion",
              "vi": "quản lý nhà chòi, gian nhà ngoài trời"
          }
      ]
  },
  "clearing": {
      "word": "clearing",
      "pos": "n",
      "level": "C1",
      "ipa": "/ˈklɪrɪŋ/",
      "meaning": "khoảng đất trống giữa rừng",
      "explanation": "Từ loại Danh từ chỉ \"khoảng đất trống giữa rừng\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the clearing during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến khoảng đất trống giữa rừng trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard clearing",
              "vi": "khoảng đất trống giữa rừng tiêu chuẩn"
          },
          {
              "en": "manage the clearing",
              "vi": "quản lý khoảng đất trống giữa rừng"
          }
      ]
  },
  "assemble": {
      "word": "assemble",
      "pos": "v",
      "level": "B2",
      "ipa": "/əˈsembl/",
      "meaning": "lắp ráp, dựng khung",
      "explanation": "Từ loại Động từ mang nghĩa \"lắp ráp, dựng khung\". Trong TOEIC Part 1, từ này thường được dùng ở dạng V-ing để miêu tả hành động đang diễn ra của nhân vật trong bức ảnh.",
      "example": {
          "en": "A staff member is preparing to assemble according to company guidelines.",
          "vi": "Một nhân viên đang chuẩn bị lắp ráp, dựng khung theo đúng hướng dẫn của công ty."
      },
      "collocations": [
          {
              "en": "assemble properly",
              "vi": "lắp ráp, dựng khung một cách chuẩn xác"
          },
          {
              "en": "need to assemble",
              "vi": "cần phải lắp ráp, dựng khung"
          }
      ]
  },
  "pour": {
      "word": "pour",
      "pos": "v",
      "level": "A2",
      "ipa": "/pɔːr/",
      "meaning": "rót, đổ (chất lỏng)",
      "explanation": "Từ loại Động từ mang nghĩa \"rót, đổ (chất lỏng)\". Trong TOEIC Part 1, từ này thường được dùng ở dạng V-ing để miêu tả hành động đang diễn ra của nhân vật trong bức ảnh.",
      "example": {
          "en": "A staff member is preparing to pour according to company guidelines.",
          "vi": "Một nhân viên đang chuẩn bị rót, đổ (chất lỏng) theo đúng hướng dẫn của công ty."
      },
      "collocations": [
          {
              "en": "pour properly",
              "vi": "rót, đổ (chất lỏng) một cách chuẩn xác"
          },
          {
              "en": "need to pour",
              "vi": "cần phải rót, đổ (chất lỏng)"
          }
      ]
  },
  "liquid": {
      "word": "liquid",
      "pos": "n",
      "level": "B1",
      "ipa": "/ˈlɪk.wɪd/",
      "meaning": "chất lỏng",
      "explanation": "Từ loại Danh từ chỉ \"chất lỏng\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the liquid during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến chất lỏng trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard liquid",
              "vi": "chất lỏng tiêu chuẩn"
          },
          {
              "en": "manage the liquid",
              "vi": "quản lý chất lỏng"
          }
      ]
  },
  "iron": {
      "word": "iron",
      "pos": "v",
      "level": "A2",
      "ipa": "/ˈaɪən/",
      "meaning": "là, ủi (quần áo)",
      "explanation": "Từ loại Động từ mang nghĩa \"là, ủi (quần áo)\". Trong TOEIC Part 1, từ này thường được dùng ở dạng V-ing để miêu tả hành động đang diễn ra của nhân vật trong bức ảnh.",
      "example": {
          "en": "A staff member is preparing to iron according to company guidelines.",
          "vi": "Một nhân viên đang chuẩn bị là, ủi (quần áo) theo đúng hướng dẫn của công ty."
      },
      "collocations": [
          {
              "en": "iron properly",
              "vi": "là, ủi (quần áo) một cách chuẩn xác"
          },
          {
              "en": "need to iron",
              "vi": "cần phải là, ủi (quần áo)"
          }
      ]
  },
  "document": {
      "word": "document",
      "pos": "n",
      "level": "B1",
      "ipa": "/ˈdɒk.jə.mənt/",
      "meaning": "tài liệu, văn kiện",
      "explanation": "Từ loại Danh từ chỉ \"tài liệu, văn kiện\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the document during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến tài liệu, văn kiện trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard document",
              "vi": "tài liệu, văn kiện tiêu chuẩn"
          },
          {
              "en": "manage the document",
              "vi": "quản lý tài liệu, văn kiện"
          }
      ]
  },
  "binder": {
      "word": "binder",
      "pos": "n",
      "level": "B2",
      "ipa": "/ˈbaɪn.dər/",
      "meaning": "bìa kẹp hồ sơ, sổ tài liệu",
      "explanation": "Từ loại Danh từ chỉ \"bìa kẹp hồ sơ, sổ tài liệu\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the binder during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến bìa kẹp hồ sơ, sổ tài liệu trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard binder",
              "vi": "bìa kẹp hồ sơ, sổ tài liệu tiêu chuẩn"
          },
          {
              "en": "manage the binder",
              "vi": "quản lý bìa kẹp hồ sơ, sổ tài liệu"
          }
      ]
  },
  "hallway": {
      "word": "hallway",
      "pos": "n",
      "level": "B1",
      "ipa": "/ˈhɔːl.weɪ/",
      "meaning": "hành lang lối đi",
      "explanation": "Từ loại Danh từ chỉ \"hành lang lối đi\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the hallway during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến hành lang lối đi trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard hallway",
              "vi": "hành lang lối đi tiêu chuẩn"
          },
          {
              "en": "manage the hallway",
              "vi": "quản lý hành lang lối đi"
          }
      ]
  },
  "float": {
      "word": "float",
      "pos": "v",
      "level": "B1",
      "ipa": "/fləʊt/",
      "meaning": "nổi, trôi lơ lửng trên mặt nước",
      "explanation": "Từ loại Động từ mang nghĩa \"nổi, trôi lơ lửng trên mặt nước\". Trong TOEIC Part 1, từ này thường được dùng ở dạng V-ing để miêu tả hành động đang diễn ra của nhân vật trong bức ảnh.",
      "example": {
          "en": "A staff member is preparing to float according to company guidelines.",
          "vi": "Một nhân viên đang chuẩn bị nổi, trôi lơ lửng trên mặt nước theo đúng hướng dẫn của công ty."
      },
      "collocations": [
          {
              "en": "float properly",
              "vi": "nổi, trôi lơ lửng trên mặt nước một cách chuẩn xác"
          },
          {
              "en": "need to float",
              "vi": "cần phải nổi, trôi lơ lửng trên mặt nước"
          }
      ]
  },
  "cargo": {
      "word": "cargo",
      "pos": "n",
      "level": "B2",
      "ipa": "/ˈkɑː.ɡəʊ/",
      "meaning": "hàng hóa (vận tải tàu xe)",
      "explanation": "Từ loại Danh từ chỉ \"hàng hóa (vận tải tàu xe)\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the cargo during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến hàng hóa (vận tải tàu xe) trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard cargo",
              "vi": "hàng hóa (vận tải tàu xe) tiêu chuẩn"
          },
          {
              "en": "manage the cargo",
              "vi": "quản lý hàng hóa (vận tải tàu xe)"
          }
      ]
  },
  "lighthouse": {
      "word": "lighthouse",
      "pos": "n",
      "level": "B2",
      "ipa": "/ˈlaɪt.haʊs/",
      "meaning": "ngọn hải đăng",
      "explanation": "Từ loại Danh từ chỉ \"ngọn hải đăng\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the lighthouse during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến ngọn hải đăng trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard lighthouse",
              "vi": "ngọn hải đăng tiêu chuẩn"
          },
          {
              "en": "manage the lighthouse",
              "vi": "quản lý ngọn hải đăng"
          }
      ]
  },
  "fireplace": {
      "word": "fireplace",
      "pos": "n",
      "level": "B1",
      "ipa": "/ˈfaɪə.pleɪs/",
      "meaning": "lò sưởi (trong phòng)",
      "explanation": "Từ loại Danh từ chỉ \"lò sưởi (trong phòng)\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the fireplace during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến lò sưởi (trong phòng) trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard fireplace",
              "vi": "lò sưởi (trong phòng) tiêu chuẩn"
          },
          {
              "en": "manage the fireplace",
              "vi": "quản lý lò sưởi (trong phòng)"
          }
      ]
  },
  "beside": {
      "word": "beside",
      "pos": "prep",
      "level": "A2",
      "ipa": "/bɪˈsaɪd/",
      "meaning": "bên cạnh, sát cạnh",
      "explanation": "Từ loại Tính từ biểu thị đặc điểm \"bên cạnh, sát cạnh\". Thường dùng để bổ nghĩa cho danh từ, mô tả trạng thái của đồ vật hoặc không gian làm việc.",
      "example": {
          "en": "All items in the office are kept in a beside condition.",
          "vi": "Tất cả các vật dụng trong văn phòng đều được duy trì trong tình trạng bên cạnh, sát cạnh."
      },
      "collocations": [
          {
              "en": "remain beside",
              "vi": "duy trì trạng thái bên cạnh, sát cạnh"
          },
          {
              "en": "highly beside",
              "vi": "rất bên cạnh, sát cạnh"
          }
      ]
  },
  "cable": {
      "word": "cable",
      "pos": "n",
      "level": "B1",
      "ipa": "/ˈkeɪ.bəl/",
      "meaning": "dây cáp, dây điện",
      "explanation": "Từ loại Danh từ chỉ \"dây cáp, dây điện\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the cable during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến dây cáp, dây điện trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard cable",
              "vi": "dây cáp, dây điện tiêu chuẩn"
          },
          {
              "en": "manage the cable",
              "vi": "quản lý dây cáp, dây điện"
          }
      ]
  },
  "distance": {
      "word": "distance",
      "pos": "n",
      "level": "B1",
      "ipa": "/ˈdɪs.təns/",
      "meaning": "khoảng cách; in the distance: ở phía xa",
      "explanation": "Từ loại Danh từ chỉ \"khoảng cách; in the distance: ở phía xa\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the distance during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến khoảng cách; in the distance: ở phía xa trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard distance",
              "vi": "khoảng cách; in the distance: ở phía xa tiêu chuẩn"
          },
          {
              "en": "manage the distance",
              "vi": "quản lý khoảng cách; in the distance: ở phía xa"
          }
      ]
  },
  "picnic table": {
      "word": "picnic table",
      "pos": "n",
      "level": "A2",
      "ipa": "/ˈpɪk.nɪk ˈteɪ.bəl/",
      "meaning": "bàn dã ngoại ngoài trời",
      "explanation": "Từ loại Danh từ chỉ \"bàn dã ngoại ngoài trời\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the picnic table during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến bàn dã ngoại ngoài trời trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard picnic table",
              "vi": "bàn dã ngoại ngoài trời tiêu chuẩn"
          },
          {
              "en": "manage the picnic table",
              "vi": "quản lý bàn dã ngoại ngoài trời"
          }
      ]
  },
  "fall over": {
      "word": "fall over",
      "pos": "v",
      "level": "B1",
      "ipa": "/fɔːl ˈəʊ.vər/",
      "meaning": "ngã, đổ nhào xuống",
      "explanation": "Từ loại Động từ mang nghĩa \"ngã, đổ nhào xuống\". Trong TOEIC Part 1, từ này thường được dùng ở dạng V-ing để miêu tả hành động đang diễn ra của nhân vật trong bức ảnh.",
      "example": {
          "en": "A staff member is preparing to fall over according to company guidelines.",
          "vi": "Một nhân viên đang chuẩn bị ngã, đổ nhào xuống theo đúng hướng dẫn của công ty."
      },
      "collocations": [
          {
              "en": "fall over properly",
              "vi": "ngã, đổ nhào xuống một cách chuẩn xác"
          },
          {
              "en": "need to fall over",
              "vi": "cần phải ngã, đổ nhào xuống"
          }
      ]
  },
  "vase": {
      "word": "vase",
      "pos": "n",
      "level": "B1",
      "ipa": "/vɑːz/",
      "meaning": "bình hoa, lọ hoa",
      "explanation": "Từ loại Danh từ chỉ \"bình hoa, lọ hoa\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the vase during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến bình hoa, lọ hoa trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard vase",
              "vi": "bình hoa, lọ hoa tiêu chuẩn"
          },
          {
              "en": "manage the vase",
              "vi": "quản lý bình hoa, lọ hoa"
          }
      ]
  },
  "note": {
      "word": "note",
      "pos": "n",
      "level": "A2",
      "ipa": "/nəʊt/",
      "meaning": "ghi chú, dòng ghi chép",
      "explanation": "Từ loại Danh từ chỉ \"ghi chú, dòng ghi chép\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the note during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến ghi chú, dòng ghi chép trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard note",
              "vi": "ghi chú, dòng ghi chép tiêu chuẩn"
          },
          {
              "en": "manage the note",
              "vi": "quản lý ghi chú, dòng ghi chép"
          }
      ]
  },
  "cart": {
      "word": "cart",
      "pos": "n",
      "level": "B1",
      "ipa": "/kɑːt/",
      "meaning": "xe đẩy hàng",
      "explanation": "Từ loại Danh từ chỉ \"xe đẩy hàng\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the cart during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến xe đẩy hàng trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard cart",
              "vi": "xe đẩy hàng tiêu chuẩn"
          },
          {
              "en": "manage the cart",
              "vi": "quản lý xe đẩy hàng"
          }
      ]
  },
  "plant": {
      "word": "plant",
      "pos": "n",
      "level": "A1",
      "ipa": "/plɑːnt/",
      "meaning": "cây cối, thực vật cảnh",
      "explanation": "Từ loại Danh từ chỉ \"cây cối, thực vật cảnh\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the plant during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến cây cối, thực vật cảnh trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard plant",
              "vi": "cây cối, thực vật cảnh tiêu chuẩn"
          },
          {
              "en": "manage the plant",
              "vi": "quản lý cây cối, thực vật cảnh"
          }
      ]
  },
  "suitcase": {
      "word": "suitcase",
      "pos": "n",
      "level": "A2",
      "ipa": "/ˈsuːt.keɪs/",
      "meaning": "vali hành lý",
      "explanation": "Từ loại Danh từ chỉ \"vali hành lý\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the suitcase during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến vali hành lý trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard suitcase",
              "vi": "vali hành lý tiêu chuẩn"
          },
          {
              "en": "manage the suitcase",
              "vi": "quản lý vali hành lý"
          }
      ]
  },
  "luggage rack": {
      "word": "luggage rack",
      "pos": "n",
      "level": "B1",
      "ipa": "/ˈlʌɡ.ɪdʒ ræk/",
      "meaning": "giá để hành lý",
      "explanation": "Từ loại Danh từ chỉ \"giá để hành lý\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the luggage rack during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến giá để hành lý trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard luggage rack",
              "vi": "giá để hành lý tiêu chuẩn"
          },
          {
              "en": "manage the luggage rack",
              "vi": "quản lý giá để hành lý"
          }
      ]
  },
  "hike": {
      "word": "hike",
      "pos": "v",
      "level": "B1",
      "ipa": "/haɪk/",
      "meaning": "đi bộ đường dài, leo núi dã ngoại",
      "explanation": "Từ loại Động từ mang nghĩa \"đi bộ đường dài, leo núi dã ngoại\". Trong TOEIC Part 1, từ này thường được dùng ở dạng V-ing để miêu tả hành động đang diễn ra của nhân vật trong bức ảnh.",
      "example": {
          "en": "A staff member is preparing to hike according to company guidelines.",
          "vi": "Một nhân viên đang chuẩn bị đi bộ đường dài, leo núi dã ngoại theo đúng hướng dẫn của công ty."
      },
      "collocations": [
          {
              "en": "hike properly",
              "vi": "đi bộ đường dài, leo núi dã ngoại một cách chuẩn xác"
          },
          {
              "en": "need to hike",
              "vi": "cần phải đi bộ đường dài, leo núi dã ngoại"
          }
      ]
  },
  "path": {
      "word": "path",
      "pos": "n",
      "level": "A2",
      "ipa": "/pɑːθ/",
      "meaning": "con đường mòn, lối đi",
      "explanation": "Từ loại Danh từ chỉ \"con đường mòn, lối đi\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the path during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến con đường mòn, lối đi trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard path",
              "vi": "con đường mòn, lối đi tiêu chuẩn"
          },
          {
              "en": "manage the path",
              "vi": "quản lý con đường mòn, lối đi"
          }
      ]
  },
  "shoelace": {
      "word": "shoelace",
      "pos": "n",
      "level": "B1",
      "ipa": "/ˈʃuː.leɪs/",
      "meaning": "dây giày",
      "explanation": "Từ loại Danh từ chỉ \"dây giày\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the shoelace during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến dây giày trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard shoelace",
              "vi": "dây giày tiêu chuẩn"
          },
          {
              "en": "manage the shoelace",
              "vi": "quản lý dây giày"
          }
      ]
  },
  "kneel down": {
      "word": "kneel down",
      "pos": "v",
      "level": "B2",
      "ipa": "/niːl daʊn/",
      "meaning": "quỳ gối xuống sàn",
      "explanation": "Từ loại Động từ mang nghĩa \"quỳ gối xuống sàn\". Trong TOEIC Part 1, từ này thường được dùng ở dạng V-ing để miêu tả hành động đang diễn ra của nhân vật trong bức ảnh.",
      "example": {
          "en": "A staff member is preparing to kneel down according to company guidelines.",
          "vi": "Một nhân viên đang chuẩn bị quỳ gối xuống sàn theo đúng hướng dẫn của công ty."
      },
      "collocations": [
          {
              "en": "kneel down properly",
              "vi": "quỳ gối xuống sàn một cách chuẩn xác"
          },
          {
              "en": "need to kneel down",
              "vi": "cần phải quỳ gối xuống sàn"
          }
      ]
  },
  "tile": {
      "word": "tile",
      "pos": "n",
      "level": "B1",
      "ipa": "/taɪl/",
      "meaning": "gạch lát sàn, ngói",
      "explanation": "Từ loại Danh từ chỉ \"gạch lát sàn, ngói\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the tile during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến gạch lát sàn, ngói trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard tile",
              "vi": "gạch lát sàn, ngói tiêu chuẩn"
          },
          {
              "en": "manage the tile",
              "vi": "quản lý gạch lát sàn, ngói"
          }
      ]
  },
  "umbrella": {
      "word": "umbrella",
      "pos": "n",
      "level": "A1",
      "ipa": "/ʌmˈbrel.ə/",
      "meaning": "chiếc dù, ô che nắng lớn",
      "explanation": "Từ loại Danh từ chỉ \"chiếc dù, ô che nắng lớn\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the umbrella during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến chiếc dù, ô che nắng lớn trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard umbrella",
              "vi": "chiếc dù, ô che nắng lớn tiêu chuẩn"
          },
          {
              "en": "manage the umbrella",
              "vi": "quản lý chiếc dù, ô che nắng lớn"
          }
      ]
  },
  "trim": {
      "word": "trim",
      "pos": "v",
      "level": "B2",
      "ipa": "/trɪm/",
      "meaning": "cắt tỉa, tỉa bớt (cây cảnh)",
      "explanation": "Từ loại Động từ mang nghĩa \"cắt tỉa, tỉa bớt (cây cảnh)\". Trong TOEIC Part 1, từ này thường được dùng ở dạng V-ing để miêu tả hành động đang diễn ra của nhân vật trong bức ảnh.",
      "example": {
          "en": "A staff member is preparing to trim according to company guidelines.",
          "vi": "Một nhân viên đang chuẩn bị cắt tỉa, tỉa bớt (cây cảnh) theo đúng hướng dẫn của công ty."
      },
      "collocations": [
          {
              "en": "trim properly",
              "vi": "cắt tỉa, tỉa bớt (cây cảnh) một cách chuẩn xác"
          },
          {
              "en": "need to trim",
              "vi": "cần phải cắt tỉa, tỉa bớt (cây cảnh)"
          }
      ]
  },
  "stack": {
      "word": "stack",
      "pos": "v",
      "level": "B2",
      "ipa": "/stæk/",
      "meaning": "xếp chồng lên nhau",
      "explanation": "Từ loại Động từ mang nghĩa \"xếp chồng lên nhau\". Trong TOEIC Part 1, từ này thường được dùng ở dạng V-ing để miêu tả hành động đang diễn ra của nhân vật trong bức ảnh.",
      "example": {
          "en": "A staff member is preparing to stack according to company guidelines.",
          "vi": "Một nhân viên đang chuẩn bị xếp chồng lên nhau theo đúng hướng dẫn của công ty."
      },
      "collocations": [
          {
              "en": "stack properly",
              "vi": "xếp chồng lên nhau một cách chuẩn xác"
          },
          {
              "en": "need to stack",
              "vi": "cần phải xếp chồng lên nhau"
          }
      ]
  },
  "pile up": {
      "word": "pile up",
      "pos": "v",
      "level": "B2",
      "ipa": "/paɪl ʌp/",
      "meaning": "chất đống, xếp chồng lên nhau",
      "explanation": "Từ loại Động từ mang nghĩa \"chất đống, xếp chồng lên nhau\". Trong TOEIC Part 1, từ này thường được dùng ở dạng V-ing để miêu tả hành động đang diễn ra của nhân vật trong bức ảnh.",
      "example": {
          "en": "A staff member is preparing to pile up according to company guidelines.",
          "vi": "Một nhân viên đang chuẩn bị chất đống, xếp chồng lên nhau theo đúng hướng dẫn của công ty."
      },
      "collocations": [
          {
              "en": "pile up properly",
              "vi": "chất đống, xếp chồng lên nhau một cách chuẩn xác"
          },
          {
              "en": "need to pile up",
              "vi": "cần phải chất đống, xếp chồng lên nhau"
          }
      ]
  },
  "rug": {
      "word": "rug",
      "pos": "n",
      "level": "B1",
      "ipa": "/rʌɡ/",
      "meaning": "tấm thảm trải sàn",
      "explanation": "Từ loại Danh từ chỉ \"tấm thảm trải sàn\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the rug during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến tấm thảm trải sàn trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard rug",
              "vi": "tấm thảm trải sàn tiêu chuẩn"
          },
          {
              "en": "manage the rug",
              "vi": "quản lý tấm thảm trải sàn"
          }
      ]
  },
  "water bottle": {
      "word": "water bottle",
      "pos": "n",
      "level": "A2",
      "ipa": "/ˈwɔː.tər ˈbɒt.əl/",
      "meaning": "bình nước cá nhân",
      "explanation": "Từ loại Danh từ chỉ \"bình nước cá nhân\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the water bottle during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến bình nước cá nhân trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard water bottle",
              "vi": "bình nước cá nhân tiêu chuẩn"
          },
          {
              "en": "manage the water bottle",
              "vi": "quản lý bình nước cá nhân"
          }
      ]
  },
  "diner": {
      "word": "diner",
      "pos": "n",
      "level": "B2",
      "ipa": "/ˈdaɪ.nər/",
      "meaning": "thực khách dùng bữa",
      "explanation": "Từ loại Danh từ chỉ \"thực khách dùng bữa\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the diner during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến thực khách dùng bữa trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard diner",
              "vi": "thực khách dùng bữa tiêu chuẩn"
          },
          {
              "en": "manage the diner",
              "vi": "quản lý thực khách dùng bữa"
          }
      ]
  },
  "trolley": {
      "word": "trolley",
      "pos": "n",
      "level": "B2",
      "ipa": "/ˈtrɒl.i/",
      "meaning": "xe đẩy đồ ăn hoặc hành lý",
      "explanation": "Từ loại Danh từ chỉ \"xe đẩy đồ ăn hoặc hành lý\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the trolley during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến xe đẩy đồ ăn hoặc hành lý trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard trolley",
              "vi": "xe đẩy đồ ăn hoặc hành lý tiêu chuẩn"
          },
          {
              "en": "manage the trolley",
              "vi": "quản lý xe đẩy đồ ăn hoặc hành lý"
          }
      ]
  },
  "bucket": {
      "word": "bucket",
      "pos": "n",
      "level": "B1",
      "ipa": "/ˈbʌk.ɪt/",
      "meaning": "cái xô, thùng đựng nước",
      "explanation": "Từ loại Danh từ chỉ \"cái xô, thùng đựng nước\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the bucket during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến cái xô, thùng đựng nước trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard bucket",
              "vi": "cái xô, thùng đựng nước tiêu chuẩn"
          },
          {
              "en": "manage the bucket",
              "vi": "quản lý cái xô, thùng đựng nước"
          }
      ]
  },
  "scrub": {
      "word": "scrub",
      "pos": "v",
      "level": "B2",
      "ipa": "/skrʌb/",
      "meaning": "chà rửa, cọ sạch",
      "explanation": "Từ loại Động từ mang nghĩa \"chà rửa, cọ sạch\". Trong TOEIC Part 1, từ này thường được dùng ở dạng V-ing để miêu tả hành động đang diễn ra của nhân vật trong bức ảnh.",
      "example": {
          "en": "A staff member is preparing to scrub according to company guidelines.",
          "vi": "Một nhân viên đang chuẩn bị chà rửa, cọ sạch theo đúng hướng dẫn của công ty."
      },
      "collocations": [
          {
              "en": "scrub properly",
              "vi": "chà rửa, cọ sạch một cách chuẩn xác"
          },
          {
              "en": "need to scrub",
              "vi": "cần phải chà rửa, cọ sạch"
          }
      ]
  },
  "unoccupied": {
      "word": "unoccupied",
      "pos": "adj",
      "level": "B2",
      "ipa": "/ʌnˈɒk.jə.paɪd/",
      "meaning": "trống, không có người ngồi/ở",
      "explanation": "Từ loại Tính từ biểu thị đặc điểm \"trống, không có người ngồi/ở\". Thường dùng để bổ nghĩa cho danh từ, mô tả trạng thái của đồ vật hoặc không gian làm việc.",
      "example": {
          "en": "All items in the office are kept in a unoccupied condition.",
          "vi": "Tất cả các vật dụng trong văn phòng đều được duy trì trong tình trạng trống, không có người ngồi/ở."
      },
      "collocations": [
          {
              "en": "remain unoccupied",
              "vi": "duy trì trạng thái trống, không có người ngồi/ở"
          },
          {
              "en": "highly unoccupied",
              "vi": "rất trống, không có người ngồi/ở"
          }
      ]
  },
  "fountain": {
      "word": "fountain",
      "pos": "n",
      "level": "B1",
      "ipa": "/ˈfaʊn.tɪn/",
      "meaning": "đài phun nước",
      "explanation": "Từ loại Danh từ chỉ \"đài phun nước\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the fountain during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến đài phun nước trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard fountain",
              "vi": "đài phun nước tiêu chuẩn"
          },
          {
              "en": "manage the fountain",
              "vi": "quản lý đài phun nước"
          }
      ]
  },
  "stairway": {
      "word": "stairway",
      "pos": "n",
      "level": "B1",
      "ipa": "/ˈsteə.weɪ/",
      "meaning": "cầu thang bộ ngoài trời",
      "explanation": "Từ loại Danh từ chỉ \"cầu thang bộ ngoài trời\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the stairway during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến cầu thang bộ ngoài trời trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard stairway",
              "vi": "cầu thang bộ ngoài trời tiêu chuẩn"
          },
          {
              "en": "manage the stairway",
              "vi": "quản lý cầu thang bộ ngoài trời"
          }
      ]
  },
  "pedestrian bridge": {
      "word": "pedestrian bridge",
      "pos": "n",
      "level": "B2",
      "ipa": "/pəˈdes.tri.ən brɪdʒ/",
      "meaning": "cầu đi bộ",
      "explanation": "Từ loại Danh từ chỉ \"cầu đi bộ\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the pedestrian bridge during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến cầu đi bộ trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard pedestrian bridge",
              "vi": "cầu đi bộ tiêu chuẩn"
          },
          {
              "en": "manage the pedestrian bridge",
              "vi": "quản lý cầu đi bộ"
          }
      ]
  },
  "brick": {
      "word": "brick",
      "pos": "n",
      "level": "B1",
      "ipa": "/brɪk/",
      "meaning": "viên gạch, gạch xây dựng",
      "explanation": "Từ loại Danh từ chỉ \"viên gạch, gạch xây dựng\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the brick during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến viên gạch, gạch xây dựng trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard brick",
              "vi": "viên gạch, gạch xây dựng tiêu chuẩn"
          },
          {
              "en": "manage the brick",
              "vi": "quản lý viên gạch, gạch xây dựng"
          }
      ]
  },
  "planter box": {
      "word": "planter box",
      "pos": "n",
      "level": "B2",
      "ipa": "/ˈplɑːn.tər bɒks/",
      "meaning": "bồn hoa, hộp trồng cây bằng gỗ/xi măng",
      "explanation": "Từ loại Danh từ chỉ \"bồn hoa, hộp trồng cây bằng gỗ/xi măng\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the planter box during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến bồn hoa, hộp trồng cây bằng gỗ/xi măng trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard planter box",
              "vi": "bồn hoa, hộp trồng cây bằng gỗ/xi măng tiêu chuẩn"
          },
          {
              "en": "manage the planter box",
              "vi": "quản lý bồn hoa, hộp trồng cây bằng gỗ/xi măng"
          }
      ]
  },
  "examine": {
      "word": "examine",
      "pos": "v",
      "level": "B1",
      "ipa": "/ɪɡˈzæm.ɪn/",
      "meaning": "quan sát, xem xét kỹ lưỡng",
      "explanation": "Từ loại Động từ mang nghĩa \"quan sát, xem xét kỹ lưỡng\". Trong TOEIC Part 1, từ này thường được dùng ở dạng V-ing để miêu tả hành động đang diễn ra của nhân vật trong bức ảnh.",
      "example": {
          "en": "A staff member is preparing to examine according to company guidelines.",
          "vi": "Một nhân viên đang chuẩn bị quan sát, xem xét kỹ lưỡng theo đúng hướng dẫn của công ty."
      },
      "collocations": [
          {
              "en": "examine properly",
              "vi": "quan sát, xem xét kỹ lưỡng một cách chuẩn xác"
          },
          {
              "en": "need to examine",
              "vi": "cần phải quan sát, xem xét kỹ lưỡng"
          }
      ]
  },
  "pallet": {
      "word": "pallet",
      "pos": "n",
      "level": "B2",
      "ipa": "/ˈpæl.ət/",
      "meaning": "tấm kê hàng pallet bằng gỗ",
      "explanation": "Từ loại Danh từ chỉ \"tấm kê hàng pallet bằng gỗ\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the pallet during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến tấm kê hàng pallet bằng gỗ trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard pallet",
              "vi": "tấm kê hàng pallet bằng gỗ tiêu chuẩn"
          },
          {
              "en": "manage the pallet",
              "vi": "quản lý tấm kê hàng pallet bằng gỗ"
          }
      ]
  },
  "hook": {
      "word": "hook",
      "pos": "n",
      "level": "B1",
      "ipa": "/hʊk/",
      "meaning": "móc treo quần áo",
      "explanation": "Từ loại Danh từ chỉ \"móc treo quần áo\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the hook during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến móc treo quần áo trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard hook",
              "vi": "móc treo quần áo tiêu chuẩn"
          },
          {
              "en": "manage the hook",
              "vi": "quản lý móc treo quần áo"
          }
      ]
  },
  "restock": {
      "word": "restock",
      "pos": "v",
      "level": "B2",
      "ipa": "/riːˈstɒk/",
      "meaning": "bổ sung hàng hóa lên kệ",
      "explanation": "Từ loại Động từ mang nghĩa \"bổ sung hàng hóa lên kệ\". Trong TOEIC Part 1, từ này thường được dùng ở dạng V-ing để miêu tả hành động đang diễn ra của nhân vật trong bức ảnh.",
      "example": {
          "en": "A staff member is preparing to restock according to company guidelines.",
          "vi": "Một nhân viên đang chuẩn bị bổ sung hàng hóa lên kệ theo đúng hướng dẫn của công ty."
      },
      "collocations": [
          {
              "en": "restock properly",
              "vi": "bổ sung hàng hóa lên kệ một cách chuẩn xác"
          },
          {
              "en": "need to restock",
              "vi": "cần phải bổ sung hàng hóa lên kệ"
          }
      ]
  },
  "wipe down": {
      "word": "wipe down",
      "pos": "v",
      "level": "B1",
      "ipa": "/waɪp daʊn/",
      "meaning": "lau sạch bằng khăn",
      "explanation": "Từ loại Động từ mang nghĩa \"lau sạch bằng khăn\". Trong TOEIC Part 1, từ này thường được dùng ở dạng V-ing để miêu tả hành động đang diễn ra của nhân vật trong bức ảnh.",
      "example": {
          "en": "A staff member is preparing to wipe down according to company guidelines.",
          "vi": "Một nhân viên đang chuẩn bị lau sạch bằng khăn theo đúng hướng dẫn của công ty."
      },
      "collocations": [
          {
              "en": "wipe down properly",
              "vi": "lau sạch bằng khăn một cách chuẩn xác"
          },
          {
              "en": "need to wipe down",
              "vi": "cần phải lau sạch bằng khăn"
          }
      ]
  },
  "street corner": {
      "word": "street corner",
      "pos": "n",
      "level": "A2",
      "ipa": "/striːt ˈkɔː.nər/",
      "meaning": "góc phố, ngã rẽ góc đường",
      "explanation": "Từ loại Danh từ chỉ \"góc phố, ngã rẽ góc đường\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the street corner during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến góc phố, ngã rẽ góc đường trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard street corner",
              "vi": "góc phố, ngã rẽ góc đường tiêu chuẩn"
          },
          {
              "en": "manage the street corner",
              "vi": "quản lý góc phố, ngã rẽ góc đường"
          }
      ]
  },
  "balcony": {
      "word": "balcony",
      "pos": "n",
      "level": "B1",
      "ipa": "/ˈbæl.kə.ni/",
      "meaning": "ban công",
      "explanation": "Từ loại Danh từ chỉ \"ban công\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the balcony during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến ban công trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard balcony",
              "vi": "ban công tiêu chuẩn"
          },
          {
              "en": "manage the balcony",
              "vi": "quản lý ban công"
          }
      ]
  },
  "bike rack": {
      "word": "bike rack",
      "pos": "n",
      "level": "B1",
      "ipa": "/baɪk ræk/",
      "meaning": "giá để xe đạp kim loại",
      "explanation": "Từ loại Danh từ chỉ \"giá để xe đạp kim loại\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the bike rack during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến giá để xe đạp kim loại trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard bike rack",
              "vi": "giá để xe đạp kim loại tiêu chuẩn"
          },
          {
              "en": "manage the bike rack",
              "vi": "quản lý giá để xe đạp kim loại"
          }
      ]
  },
  "curtain": {
      "word": "curtain",
      "pos": "n",
      "level": "A2",
      "ipa": "/ˈkɜː.tən/",
      "meaning": "rèm cửa, màn che",
      "explanation": "Từ loại Danh từ chỉ \"rèm cửa, màn che\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the curtain during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến rèm cửa, màn che trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard curtain",
              "vi": "rèm cửa, màn che tiêu chuẩn"
          },
          {
              "en": "manage the curtain",
              "vi": "quản lý rèm cửa, màn che"
          }
      ]
  },
  "block": {
      "word": "block",
      "pos": "v",
      "level": "B1",
      "ipa": "/blɒk/",
      "meaning": "ngăn chặn, che chắn",
      "explanation": "Từ loại Động từ mang nghĩa \"ngăn chặn, che chắn\". Trong TOEIC Part 1, từ này thường được dùng ở dạng V-ing để miêu tả hành động đang diễn ra của nhân vật trong bức ảnh.",
      "example": {
          "en": "A staff member is preparing to block according to company guidelines.",
          "vi": "Một nhân viên đang chuẩn bị ngăn chặn, che chắn theo đúng hướng dẫn của công ty."
      },
      "collocations": [
          {
              "en": "block properly",
              "vi": "ngăn chặn, che chắn một cách chuẩn xác"
          },
          {
              "en": "need to block",
              "vi": "cần phải ngăn chặn, che chắn"
          }
      ]
  },
  "lean over": {
      "word": "lean over",
      "pos": "v",
      "level": "B2",
      "ipa": "/liːn ˈəʊ.vər/",
      "meaning": "cúi người, nghiêng người qua",
      "explanation": "Từ loại Động từ mang nghĩa \"cúi người, nghiêng người qua\". Trong TOEIC Part 1, từ này thường được dùng ở dạng V-ing để miêu tả hành động đang diễn ra của nhân vật trong bức ảnh.",
      "example": {
          "en": "A staff member is preparing to lean over according to company guidelines.",
          "vi": "Một nhân viên đang chuẩn bị cúi người, nghiêng người qua theo đúng hướng dẫn của công ty."
      },
      "collocations": [
          {
              "en": "lean over properly",
              "vi": "cúi người, nghiêng người qua một cách chuẩn xác"
          },
          {
              "en": "need to lean over",
              "vi": "cần phải cúi người, nghiêng người qua"
          }
      ]
  },
  "badge": {
      "word": "badge",
      "pos": "n",
      "level": "B1",
      "ipa": "/bædʒ/",
      "meaning": "thẻ đeo, huy hiệu nhân viên",
      "explanation": "Từ loại Danh từ chỉ \"thẻ đeo, huy hiệu nhân viên\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the badge during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến thẻ đeo, huy hiệu nhân viên trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard badge",
              "vi": "thẻ đeo, huy hiệu nhân viên tiêu chuẩn"
          },
          {
              "en": "manage the badge",
              "vi": "quản lý thẻ đeo, huy hiệu nhân viên"
          }
      ]
  },
  "railing": {
      "word": "railing",
      "pos": "n",
      "level": "B2",
      "ipa": "/ˈreɪ.lɪŋ/",
      "meaning": "lan can cầu thang/ban công",
      "explanation": "Từ loại Danh từ chỉ \"lan can cầu thang/ban công\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the railing during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến lan can cầu thang/ban công trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard railing",
              "vi": "lan can cầu thang/ban công tiêu chuẩn"
          },
          {
              "en": "manage the railing",
              "vi": "quản lý lan can cầu thang/ban công"
          }
      ]
  },
  "ladder": {
      "word": "ladder",
      "pos": "n",
      "level": "A2",
      "ipa": "/ˈlæd.ər/",
      "meaning": "chiếc thang leo",
      "explanation": "Từ loại Danh từ chỉ \"chiếc thang leo\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the ladder during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến chiếc thang leo trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard ladder",
              "vi": "chiếc thang leo tiêu chuẩn"
          },
          {
              "en": "manage the ladder",
              "vi": "quản lý chiếc thang leo"
          }
      ]
  },
  "row": {
      "word": "row",
      "pos": "v",
      "level": "B1",
      "ipa": "/rəʊ/",
      "meaning": "chèo (thuyền)",
      "explanation": "Từ loại Động từ mang nghĩa \"chèo (thuyền)\". Trong TOEIC Part 1, từ này thường được dùng ở dạng V-ing để miêu tả hành động đang diễn ra của nhân vật trong bức ảnh.",
      "example": {
          "en": "A staff member is preparing to row according to company guidelines.",
          "vi": "Một nhân viên đang chuẩn bị chèo (thuyền) theo đúng hướng dẫn của công ty."
      },
      "collocations": [
          {
              "en": "row properly",
              "vi": "chèo (thuyền) một cách chuẩn xác"
          },
          {
              "en": "need to row",
              "vi": "cần phải chèo (thuyền)"
          }
      ]
  },
  "dock": {
      "word": "dock",
      "pos": "n",
      "level": "B2",
      "ipa": "/dɒk/",
      "meaning": "bến tàu, cầu cảng nhỏ",
      "explanation": "Từ loại Danh từ chỉ \"bến tàu, cầu cảng nhỏ\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the dock during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến bến tàu, cầu cảng nhỏ trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard dock",
              "vi": "bến tàu, cầu cảng nhỏ tiêu chuẩn"
          },
          {
              "en": "manage the dock",
              "vi": "quản lý bến tàu, cầu cảng nhỏ"
          }
      ]
  },
  "necktie": {
      "word": "necktie",
      "pos": "n",
      "level": "B1",
      "ipa": "/ˈnek.taɪ/",
      "meaning": "cà vạt",
      "explanation": "Từ loại Danh từ chỉ \"cà vạt\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the necktie during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến cà vạt trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard necktie",
              "vi": "cà vạt tiêu chuẩn"
          },
          {
              "en": "manage the necktie",
              "vi": "quản lý cà vạt"
          }
      ]
  },
  "display case": {
      "word": "display case",
      "pos": "n",
      "level": "B2",
      "ipa": "/dɪˈspleɪ keɪs/",
      "meaning": "tủ kính trưng bày hàng",
      "explanation": "Từ loại Danh từ chỉ \"tủ kính trưng bày hàng\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the display case during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến tủ kính trưng bày hàng trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard display case",
              "vi": "tủ kính trưng bày hàng tiêu chuẩn"
          },
          {
              "en": "manage the display case",
              "vi": "quản lý tủ kính trưng bày hàng"
          }
      ]
  },
  "occupied": {
      "word": "occupied",
      "pos": "adj",
      "level": "B1",
      "ipa": "/ˈɒk.jə.paɪd/",
      "meaning": "đang có người ngồi, đang được sử dụng",
      "explanation": "Từ loại Tính từ biểu thị đặc điểm \"đang có người ngồi, đang được sử dụng\". Thường dùng để bổ nghĩa cho danh từ, mô tả trạng thái của đồ vật hoặc không gian làm việc.",
      "example": {
          "en": "All items in the office are kept in a occupied condition.",
          "vi": "Tất cả các vật dụng trong văn phòng đều được duy trì trong tình trạng đang có người ngồi, đang được sử dụng."
      },
      "collocations": [
          {
              "en": "remain occupied",
              "vi": "duy trì trạng thái đang có người ngồi, đang được sử dụng"
          },
          {
              "en": "highly occupied",
              "vi": "rất đang có người ngồi, đang được sử dụng"
          }
      ]
  },
  "wheelbarrow": {
      "word": "wheelbarrow",
      "pos": "n",
      "level": "B2",
      "ipa": "/ˈwiːlˌbær.əʊ/",
      "meaning": "xe cút kít, xe rùa chở đất đá",
      "explanation": "Từ loại Danh từ chỉ \"xe cút kít, xe rùa chở đất đá\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the wheelbarrow during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến xe cút kít, xe rùa chở đất đá trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard wheelbarrow",
              "vi": "xe cút kít, xe rùa chở đất đá tiêu chuẩn"
          },
          {
              "en": "manage the wheelbarrow",
              "vi": "quản lý xe cút kít, xe rùa chở đất đá"
          }
      ]
  },
  "bulletin board": {
      "word": "bulletin board",
      "pos": "n",
      "level": "B1",
      "ipa": "/ˈbʊl.ə.tɪn bɔːd/",
      "meaning": "bảng thông báo, bảng tin",
      "explanation": "Từ loại Danh từ chỉ \"bảng thông báo, bảng tin\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the bulletin board during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến bảng thông báo, bảng tin trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard bulletin board",
              "vi": "bảng thông báo, bảng tin tiêu chuẩn"
          },
          {
              "en": "manage the bulletin board",
              "vi": "quản lý bảng thông báo, bảng tin"
          }
      ]
  },
  "pin": {
      "word": "pin",
      "pos": "v",
      "level": "B1",
      "ipa": "/pɪn/",
      "meaning": "ghim lại bằng đinh ghim",
      "explanation": "Từ loại Động từ mang nghĩa \"ghim lại bằng đinh ghim\". Trong TOEIC Part 1, từ này thường được dùng ở dạng V-ing để miêu tả hành động đang diễn ra của nhân vật trong bức ảnh.",
      "example": {
          "en": "A staff member is preparing to pin according to company guidelines.",
          "vi": "Một nhân viên đang chuẩn bị ghim lại bằng đinh ghim theo đúng hướng dẫn của công ty."
      },
      "collocations": [
          {
              "en": "pin properly",
              "vi": "ghim lại bằng đinh ghim một cách chuẩn xác"
          },
          {
              "en": "need to pin",
              "vi": "cần phải ghim lại bằng đinh ghim"
          }
      ]
  },
  "climb": {
      "word": "climb",
      "pos": "v",
      "level": "A2",
      "ipa": "/klaɪm/",
      "meaning": "leo, trèo lên",
      "explanation": "Từ loại Động từ mang nghĩa \"leo, trèo lên\". Trong TOEIC Part 1, từ này thường được dùng ở dạng V-ing để miêu tả hành động đang diễn ra của nhân vật trong bức ảnh.",
      "example": {
          "en": "A staff member is preparing to climb according to company guidelines.",
          "vi": "Một nhân viên đang chuẩn bị leo, trèo lên theo đúng hướng dẫn của công ty."
      },
      "collocations": [
          {
              "en": "climb properly",
              "vi": "leo, trèo lên một cách chuẩn xác"
          },
          {
              "en": "need to climb",
              "vi": "cần phải leo, trèo lên"
          }
      ]
  },
  "doorknob": {
      "word": "doorknob",
      "pos": "n",
      "level": "B2",
      "ipa": "/ˈdɔː.nɒb/",
      "meaning": "nắm đấm cửa, quả đấm khóa cửa",
      "explanation": "Từ loại Danh từ chỉ \"nắm đấm cửa, quả đấm khóa cửa\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the doorknob during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến nắm đấm cửa, quả đấm khóa cửa trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard doorknob",
              "vi": "nắm đấm cửa, quả đấm khóa cửa tiêu chuẩn"
          },
          {
              "en": "manage the doorknob",
              "vi": "quản lý nắm đấm cửa, quả đấm khóa cửa"
          }
      ]
  },
  "seated": {
      "word": "seated",
      "pos": "adj",
      "level": "B1",
      "ipa": "/ˈsiː.tɪd/",
      "meaning": "ngồi tại chỗ",
      "explanation": "Từ loại Tính từ biểu thị đặc điểm \"ngồi tại chỗ\". Thường dùng để bổ nghĩa cho danh từ, mô tả trạng thái của đồ vật hoặc không gian làm việc.",
      "example": {
          "en": "All items in the office are kept in a seated condition.",
          "vi": "Tất cả các vật dụng trong văn phòng đều được duy trì trong tình trạng ngồi tại chỗ."
      },
      "collocations": [
          {
              "en": "remain seated",
              "vi": "duy trì trạng thái ngồi tại chỗ"
          },
          {
              "en": "highly seated",
              "vi": "rất ngồi tại chỗ"
          }
      ]
  },
  "file folder": {
      "word": "file folder",
      "pos": "n",
      "level": "B1",
      "ipa": "/faɪl ˈfəʊl.dər/",
      "meaning": "bìa kẹp tài liệu, kẹp hồ sơ",
      "explanation": "Từ loại Danh từ chỉ \"bìa kẹp tài liệu, kẹp hồ sơ\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the file folder during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến bìa kẹp tài liệu, kẹp hồ sơ trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard file folder",
              "vi": "bìa kẹp tài liệu, kẹp hồ sơ tiêu chuẩn"
          },
          {
              "en": "manage the file folder",
              "vi": "quản lý bìa kẹp tài liệu, kẹp hồ sơ"
          }
      ]
  },
  "shopper": {
      "word": "shopper",
      "pos": "n",
      "level": "A2",
      "ipa": "/ˈʃɒp.ər/",
      "meaning": "khách mua sắm",
      "explanation": "Từ loại Danh từ chỉ \"khách mua sắm\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the shopper during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến khách mua sắm trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard shopper",
              "vi": "khách mua sắm tiêu chuẩn"
          },
          {
              "en": "manage the shopper",
              "vi": "quản lý khách mua sắm"
          }
      ]
  },
  "package": {
      "word": "package",
      "pos": "n",
      "level": "B1",
      "ipa": "/ˈpæk.ɪdʒ/",
      "meaning": "bưu kiện, túi hàng đóng gói",
      "explanation": "Từ loại Danh từ chỉ \"bưu kiện, túi hàng đóng gói\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the package during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến bưu kiện, túi hàng đóng gói trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard package",
              "vi": "bưu kiện, túi hàng đóng gói tiêu chuẩn"
          },
          {
              "en": "manage the package",
              "vi": "quản lý bưu kiện, túi hàng đóng gói"
          }
      ]
  },
  "clear away": {
      "word": "clear away",
      "pos": "v",
      "level": "B1",
      "ipa": "/klɪər əˈweɪ/",
      "meaning": "dọn sạch, giải tỏa",
      "explanation": "Từ loại Động từ mang nghĩa \"dọn sạch, giải tỏa\". Trong TOEIC Part 1, từ này thường được dùng ở dạng V-ing để miêu tả hành động đang diễn ra của nhân vật trong bức ảnh.",
      "example": {
          "en": "A staff member is preparing to clear away according to company guidelines.",
          "vi": "Một nhân viên đang chuẩn bị dọn sạch, giải tỏa theo đúng hướng dẫn của công ty."
      },
      "collocations": [
          {
              "en": "clear away properly",
              "vi": "dọn sạch, giải tỏa một cách chuẩn xác"
          },
          {
              "en": "need to clear away",
              "vi": "cần phải dọn sạch, giải tỏa"
          }
      ]
  },
  "in a line": {
      "word": "in a line",
      "pos": "prep phr",
      "level": "A2",
      "ipa": "/ɪn ə laɪn/",
      "meaning": "thành một hàng thẳng",
      "explanation": "Từ loại Tính từ biểu thị đặc điểm \"thành một hàng thẳng\". Thường dùng để bổ nghĩa cho danh từ, mô tả trạng thái của đồ vật hoặc không gian làm việc.",
      "example": {
          "en": "All items in the office are kept in a in a line condition.",
          "vi": "Tất cả các vật dụng trong văn phòng đều được duy trì trong tình trạng thành một hàng thẳng."
      },
      "collocations": [
          {
              "en": "remain in a line",
              "vi": "duy trì trạng thái thành một hàng thẳng"
          },
          {
              "en": "highly in a line",
              "vi": "rất thành một hàng thẳng"
          }
      ]
  },
  "lamppost": {
      "word": "lamppost",
      "pos": "n",
      "level": "B1",
      "ipa": "/ˈlæmp.pəʊst/",
      "meaning": "cột đèn đường",
      "explanation": "Từ loại Danh từ chỉ \"cột đèn đường\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the lamppost during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến cột đèn đường trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard lamppost",
              "vi": "cột đèn đường tiêu chuẩn"
          },
          {
              "en": "manage the lamppost",
              "vi": "quản lý cột đèn đường"
          }
      ]
  },
  "try on": {
      "word": "try on",
      "pos": "v",
      "level": "A2",
      "ipa": "/traɪ ɒn/",
      "meaning": "thử đồ (quần áo, găng tay, giày dép)",
      "explanation": "Từ loại Động từ mang nghĩa \"thử đồ (quần áo, găng tay, giày dép)\". Trong TOEIC Part 1, từ này thường được dùng ở dạng V-ing để miêu tả hành động đang diễn ra của nhân vật trong bức ảnh.",
      "example": {
          "en": "A staff member is preparing to try on according to company guidelines.",
          "vi": "Một nhân viên đang chuẩn bị thử đồ (quần áo, găng tay, giày dép) theo đúng hướng dẫn của công ty."
      },
      "collocations": [
          {
              "en": "try on properly",
              "vi": "thử đồ (quần áo, găng tay, giày dép) một cách chuẩn xác"
          },
          {
              "en": "need to try on",
              "vi": "cần phải thử đồ (quần áo, găng tay, giày dép)"
          }
      ]
  },
  "glove": {
      "word": "glove",
      "pos": "n",
      "level": "A2",
      "ipa": "/ɡlʌv/",
      "meaning": "găng tay, bao tay",
      "explanation": "Từ loại Danh từ chỉ \"găng tay, bao tay\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the glove during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến găng tay, bao tay trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard glove",
              "vi": "găng tay, bao tay tiêu chuẩn"
          },
          {
              "en": "manage the glove",
              "vi": "quản lý găng tay, bao tay"
          }
      ]
  },
  "storage cabinet": {
      "word": "storage cabinet",
      "pos": "n",
      "level": "B2",
      "ipa": "/ˈstɔː.rɪdʒ ˈkæb.ɪ.nət/",
      "meaning": "tủ đựng đồ",
      "explanation": "Từ loại Danh từ chỉ \"tủ đựng đồ\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the storage cabinet during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến tủ đựng đồ trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard storage cabinet",
              "vi": "tủ đựng đồ tiêu chuẩn"
          },
          {
              "en": "manage the storage cabinet",
              "vi": "quản lý tủ đựng đồ"
          }
      ]
  },
  "rake": {
      "word": "rake",
      "pos": "v",
      "level": "B2",
      "ipa": "/reɪk/",
      "meaning": "cào (bằng cào cỏ)",
      "explanation": "Từ loại Động từ mang nghĩa \"cào (bằng cào cỏ)\". Trong TOEIC Part 1, từ này thường được dùng ở dạng V-ing để miêu tả hành động đang diễn ra của nhân vật trong bức ảnh.",
      "example": {
          "en": "A staff member is preparing to rake according to company guidelines.",
          "vi": "Một nhân viên đang chuẩn bị cào (bằng cào cỏ) theo đúng hướng dẫn của công ty."
      },
      "collocations": [
          {
              "en": "rake properly",
              "vi": "cào (bằng cào cỏ) một cách chuẩn xác"
          },
          {
              "en": "need to rake",
              "vi": "cần phải cào (bằng cào cỏ)"
          }
      ]
  },
  "garden": {
      "word": "garden",
      "pos": "n",
      "level": "A1",
      "ipa": "/ˈɡɑː.dən/",
      "meaning": "khu vườn",
      "explanation": "Từ loại Danh từ chỉ \"khu vườn\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the garden during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến khu vườn trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard garden",
              "vi": "khu vườn tiêu chuẩn"
          },
          {
              "en": "manage the garden",
              "vi": "quản lý khu vườn"
          }
      ]
  },
  "platter": {
      "word": "platter",
      "pos": "n",
      "level": "B2",
      "ipa": "/ˈplæt.ər/",
      "meaning": "đĩa lớn để bày thức ăn tiệc",
      "explanation": "Từ loại Danh từ chỉ \"đĩa lớn để bày thức ăn tiệc\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the platter during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến đĩa lớn để bày thức ăn tiệc trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard platter",
              "vi": "đĩa lớn để bày thức ăn tiệc tiêu chuẩn"
          },
          {
              "en": "manage the platter",
              "vi": "quản lý đĩa lớn để bày thức ăn tiệc"
          }
      ]
  },
  "lay out": {
      "word": "lay out",
      "pos": "v",
      "level": "B1",
      "ipa": "/leɪ aʊt/",
      "meaning": "bày biện, sắp đặt sẵn",
      "explanation": "Từ loại Động từ mang nghĩa \"bày biện, sắp đặt sẵn\". Trong TOEIC Part 1, từ này thường được dùng ở dạng V-ing để miêu tả hành động đang diễn ra của nhân vật trong bức ảnh.",
      "example": {
          "en": "A staff member is preparing to lay out according to company guidelines.",
          "vi": "Một nhân viên đang chuẩn bị bày biện, sắp đặt sẵn theo đúng hướng dẫn của công ty."
      },
      "collocations": [
          {
              "en": "lay out properly",
              "vi": "bày biện, sắp đặt sẵn một cách chuẩn xác"
          },
          {
              "en": "need to lay out",
              "vi": "cần phải bày biện, sắp đặt sẵn"
          }
      ]
  },
  "crouch down": {
      "word": "crouch down",
      "pos": "v",
      "level": "B2",
      "ipa": "/kraʊtʃ daʊn/",
      "meaning": "ngồi thụp xuống, ngồi xổm",
      "explanation": "Từ loại Động từ mang nghĩa \"ngồi thụp xuống, ngồi xổm\". Trong TOEIC Part 1, từ này thường được dùng ở dạng V-ing để miêu tả hành động đang diễn ra của nhân vật trong bức ảnh.",
      "example": {
          "en": "A staff member is preparing to crouch down according to company guidelines.",
          "vi": "Một nhân viên đang chuẩn bị ngồi thụp xuống, ngồi xổm theo đúng hướng dẫn của công ty."
      },
      "collocations": [
          {
              "en": "crouch down properly",
              "vi": "ngồi thụp xuống, ngồi xổm một cách chuẩn xác"
          },
          {
              "en": "need to crouch down",
              "vi": "cần phải ngồi thụp xuống, ngồi xổm"
          }
      ]
  },
  "counter": {
      "word": "counter",
      "pos": "n",
      "level": "B1",
      "ipa": "/ˈkaʊn.tər/",
      "meaning": "quầy phục vụ, quầy thu ngân",
      "explanation": "Từ loại Danh từ chỉ \"quầy phục vụ, quầy thu ngân\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the counter during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến quầy phục vụ, quầy thu ngân trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard counter",
              "vi": "quầy phục vụ, quầy thu ngân tiêu chuẩn"
          },
          {
              "en": "manage the counter",
              "vi": "quản lý quầy phục vụ, quầy thu ngân"
          }
      ]
  },
  "potted plant": {
      "word": "potted plant",
      "pos": "n",
      "level": "B1",
      "ipa": "/ˈpɒt.ɪd plɑːnt/",
      "meaning": "chậu cây cảnh",
      "explanation": "Từ loại Danh từ chỉ \"chậu cây cảnh\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the potted plant during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến chậu cây cảnh trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard potted plant",
              "vi": "chậu cây cảnh tiêu chuẩn"
          },
          {
              "en": "manage the potted plant",
              "vi": "quản lý chậu cây cảnh"
          }
      ]
  },
  "awning": {
      "word": "awning",
      "pos": "n",
      "level": "B2",
      "ipa": "/ˈɔː.nɪŋ/",
      "meaning": "mái hiên che nắng che mưa",
      "explanation": "Từ loại Danh từ chỉ \"mái hiên che nắng che mưa\". Trong đề thi TOEIC, từ này thường dùng để chỉ đối tượng, vật dụng hoặc địa điểm trong môi trường công sở, dịch vụ và đời sống hàng ngày.",
      "example": {
          "en": "The team reviewed the latest details regarding the awning during the orientation.",
          "vi": "Nhóm đã xem xét các thông tin mới nhất liên quan đến mái hiên che nắng che mưa trong buổi định hướng."
      },
      "collocations": [
          {
              "en": "standard awning",
              "vi": "mái hiên che nắng che mưa tiêu chuẩn"
          },
          {
              "en": "manage the awning",
              "vi": "quản lý mái hiên che nắng che mưa"
          }
      ]
  },
  "schedule": {
    meaning: "lên lịch, sắp xếp lịch trình; thời khóa biểu",
    explanation: "Từ vựng then chốt trong môi trường công sở TOEIC. Dùng để sắp xếp các cuộc họp, chuyến bay hoặc kỳ hạn nộp dự án.",
    example: { en: "The manager scheduled a staff meeting for tomorrow morning.", vi: "Người quản lý đã lên lịch một cuộc họp nhân viên vào sáng mai." },
    collocations: [
      { en: "ahead of schedule", vi: "sớm hơn so với kế hoạch" },
      { en: "behind schedule", vi: "chậm tiến độ so với kế hoạch" },
      { en: "tight schedule", vi: "lịch trình bận rộn / sít sao" }
    ]
  },
  "confirm": {
    meaning: "xác nhận, khẳng định lại",
    explanation: "Động từ thường xuyên xuất hiện trong Part 2, 3, 4, 7 khi xác nhận đặt chỗ (booking), lịch hẹn (appointment) hoặc đơn đặt hàng (order).",
    example: { en: "Please call the hotel to confirm your reservation before arriving.", vi: "Vui lòng gọi cho khách sạn để xác nhận việc đặt phòng trước khi đến." },
    collocations: [
      { en: "confirm a reservation", vi: "xác nhận việc đặt chỗ" },
      { en: "confirm an appointment", vi: "xác nhận lịch hẹn" }
    ]
  },
  "recommend": {
    meaning: "khuyên bảo, giới thiệu, đề xuất",
    explanation: "Từ khóa quen thuộc trong Part 3 & 4: 'What does the speaker recommend?' (Người nói khuyên điều gì?).",
    example: { en: "The consultant recommended upgrading the software system.", vi: "Chuyên gia tư vấn đã đề xuất nâng cấp hệ thống phần mềm." },
    collocations: [
      { en: "highly recommend", vi: "rất khuyến khích / nhiệt tình giới thiệu" },
      { en: "recommend a course of action", vi: "đề xuất một hướng hành động" }
    ]
  },
  "maintenance": {
    meaning: "sự bảo dưỡng, bảo trì kỹ thuật",
    explanation: "Hoạt động bảo trì định kỳ các trang thiết bị máy móc, tòa nhà, hệ thống thang máy để đảm bảo an toàn.",
    example: { en: "The elevator is temporarily out of service for routine maintenance.", vi: "Thang máy tạm thời ngưng hoạt động để bảo dưỡng định kỳ." },
    collocations: [
      { en: "routine maintenance", vi: "công tác bảo trì định kỳ" },
      { en: "maintenance department", vi: "bộ phận kỹ thuật bảo dưỡng" }
    ]
  }
};

/**
 * Trả về chi tiết hoàn chỉnh cho bất kỳ từ vựng nào
 */
export function getEnrichedVocabDetail(item: any, contextSentence?: string): DetailedVocabItem {
  if (!item) {
    return {
      word: "",
      pos: "từ vựng",
      level: "A2",
      ipa: "",
      meaning: "",
      explanation: "",
      example: { en: "", vi: "" },
      collocations: []
    };
  }

  const rawWord = typeof item === "string" ? item : (item.word || "");
  const wordKey = rawWord.toLowerCase().trim();
  const curated = CURATED_TOEIC_VOCAB[wordKey];

  const pos = item.pos || curated?.pos || "Từ vựng";
  const level = item.level || item.cefrLevel || curated?.level || "B1";
  const ipa = item.ipa || curated?.ipa || `/${wordKey}/`;
  const meaning = item.meaning || curated?.meaning || "Thuật ngữ trọng tâm TOEIC";

  // 1. Explanation
  let explanation = item.explanation || item.detailedExplanation || curated?.explanation || "";
  if (!explanation) {
    const p = pos.toLowerCase();
    if (p.includes("n") || p.includes("danh")) {
      explanation = `Danh từ chỉ "${meaning}". Trong cấu trúc đề thi TOEIC, từ này thường đóng vai trò là chủ ngữ hoặc tân ngữ trong câu, xuất hiện phổ biến trong ngữ cảnh hành chính, thương mại, mua sắm hoặc mô tả sự vật trong Part 1.`;
    } else if (p.includes("v") || p.includes("động")) {
      explanation = `Động từ mang nghĩa "${meaning}". Thường được sử dụng để miêu tả hành động làm việc của nhân viên, giao dịch khách hàng hoặc các thông báo chỉ dẫn quy trình công sở trong bài thi TOEIC.`;
    } else if (p.includes("adj") || p.includes("tính")) {
      explanation = `Tính từ mang nghĩa "${meaning}". Thường đứng trước danh từ để bổ nghĩa hoặc đứng sau các động từ liên kết (be, remain, seem) nhằm mô tả đặc điểm, chất lượng dịch vụ hoặc điều kiện hợp đồng trong đề thi.`;
    } else {
      explanation = `Từ vựng cốt lõi mang nghĩa "${meaning}". Đây là thuật ngữ xuất hiện với tần suất cao trong các bài thi TOEIC thực tế cả hai kỹ năng Listening và Reading.`;
    }
  }

  // 2. Example
  let example = item.example || curated?.example;
  if (!example || (!example.en && typeof example !== "string")) {
    if (contextSentence && contextSentence.toLowerCase().includes(wordKey)) {
      example = {
        en: contextSentence,
        vi: `Câu ví dụ thực tế chứa từ "${rawWord}" trong bài thi.`
      };
    } else {
      const p = pos.toLowerCase();
      if (p.includes("v") || p.includes("động")) {
        example = {
          en: `Employees are required to ${rawWord} all relevant materials before the quarterly review.`,
          vi: `Nhân viên được yêu cầu phải ${meaning} tất cả các tài liệu liên quan trước kỳ đánh giá quý.`
        };
      } else {
        example = {
          en: `The department requested updated information regarding the ${rawWord}.`,
          vi: `Bộ phận đã yêu cầu thông tin cập nhật liên quan đến ${meaning}.`
        };
      }
    }
  } else if (typeof example === "string") {
    example = {
      en: example,
      vi: `Ví dụ ngữ cảnh thực tế của từ "${rawWord}" trong bài thi.`
    };
  }

  // 3. Collocations
  let collocations = item.collocations || curated?.collocations || [];
  if (!collocations || collocations.length === 0) {
    collocations = [
      { en: `standard ${rawWord}`, vi: `${meaning} theo tiêu chuẩn` },
      { en: `review the ${rawWord}`, vi: `xem xét ${meaning}` }
    ];
  }

  return {
    word: rawWord,
    pos,
    level,
    ipa,
    meaning,
    explanation,
    example,
    collocations,
    synonyms: item.synonyms || curated?.synonyms
  };
}
